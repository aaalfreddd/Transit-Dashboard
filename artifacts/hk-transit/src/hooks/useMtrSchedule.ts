import { useQuery } from '@tanstack/react-query';

export interface MtrTrain {
  time: string;
  dest: string;
  plat: string;
  seq: string;
}

export interface MtrSchedule {
  up: MtrTrain[];
  down: MtrTrain[];
  currTime: string;
  status: number;
  message: string;
}

const fetchMtrSchedule = async (line: string, station: string): Promise<MtrSchedule> => {
  const res = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${station}`);
  if (!res.ok) throw new Error('Failed to fetch MTR schedule');
  const json = await res.json();
  
  const key = `${line}-${station}`;
  const data = json.data?.[key];
  
  if (!data && json.status !== 1) {
     return { up: [], down: [], currTime: '', status: json.status, message: json.message };
  }
  
  return {
    up: data?.UP || [],
    down: data?.DOWN || [],
    currTime: data?.curr_time || '',
    status: json.status,
    message: json.message
  };
};

export function useMtrSchedule(line: string, station: string) {
  return useQuery({
    queryKey: ['mtr_schedule', line, station],
    queryFn: () => fetchMtrSchedule(line, station),
    refetchInterval: 30000,
    staleTime: 25000,
    enabled: !!line && !!station
  });
}
