export interface MtrStation {
  code: string;
  name_en: string;
  name_zh: string;
}

export interface MtrLine {
  code: string;
  name_en: string;
  name_zh: string;
  color: string;
  stations: MtrStation[];
}

export const MTR_LINES: MtrLine[] = [
  {
    code: "AEL", name_en: "Airport Express", name_zh: "機場快綫", color: "hsl(196 72% 40%)",
    stations: [
      { code: "HOK", name_en: "Hong Kong", name_zh: "香港" },
      { code: "KOW", name_en: "Kowloon", name_zh: "九龍" },
      { code: "TSY", name_en: "Tsing Yi", name_zh: "青衣" },
      { code: "AIR", name_en: "Airport", name_zh: "機場" },
      { code: "AWE", name_en: "AsiaWorld-Expo", name_zh: "博覽館" },
    ],
  },
  {
    code: "TCL", name_en: "Tung Chung Line", name_zh: "東涌線", color: "hsl(34 75% 49%)",
    stations: [
      { code: "HOK", name_en: "Hong Kong", name_zh: "香港" },
      { code: "KOW", name_en: "Kowloon", name_zh: "九龍" },
      { code: "OLY", name_en: "Olympic", name_zh: "奧運" },
      { code: "NAC", name_en: "Nam Cheong", name_zh: "南昌" },
      { code: "LAK", name_en: "Lai King", name_zh: "荔景" },
      { code: "TSY", name_en: "Tsing Yi", name_zh: "青衣" },
      { code: "SUN", name_en: "Sunny Bay", name_zh: "欣澳" },
      { code: "TUC", name_en: "Tung Chung", name_zh: "東涌" },
    ],
  },
  {
    code: "TML", name_en: "Tuen Ma Line", name_zh: "屯馬線", color: "hsl(147 43% 38%)",
    stations: [
      { code: "TUM", name_en: "Tuen Mun", name_zh: "屯門" },
      { code: "SIH", name_en: "Siu Hong", name_zh: "兆康" },
      { code: "TIS", name_en: "Tin Shui Wai", name_zh: "天水圍" },
      { code: "LOP", name_en: "Long Ping", name_zh: "朗屏" },
      { code: "YLS", name_en: "Yuen Long", name_zh: "元朗" },
      { code: "KSR", name_en: "Kam Sheung Road", name_zh: "錦上路" },
      { code: "TWW", name_en: "Tsuen Wan West", name_zh: "荃灣西" },
      { code: "NAC", name_en: "Nam Cheong", name_zh: "南昌" },
      { code: "AUS", name_en: "Austin", name_zh: "柯士甸" },
      { code: "ETS", name_en: "East Tsim Sha Tsui", name_zh: "尖東" },
      { code: "HUH", name_en: "Hung Hom", name_zh: "紅磡" },
      { code: "HOM", name_en: "Ho Man Tin", name_zh: "何文田" },
      { code: "TKW", name_en: "To Kwa Wan", name_zh: "土瓜灣" },
      { code: "KAT", name_en: "Kai Tak", name_zh: "啟德" },
      { code: "DIH", name_en: "Diamond Hill", name_zh: "鑽石山" },
      { code: "HIK", name_en: "Hin Keng", name_zh: "顯徑" },
      { code: "TAW", name_en: "Tai Wai", name_zh: "大圍" },
      { code: "STW", name_en: "Sha Tin Wai", name_zh: "沙田圍" },
      { code: "CIO", name_en: "City One", name_zh: "第一城" },
      { code: "SHM", name_en: "Shek Mun", name_zh: "石門" },
      { code: "TSH", name_en: "Tai Shui Hang", name_zh: "大水坑" },
      { code: "HEO", name_en: "Heng On", name_zh: "恆安" },
      { code: "MAT", name_en: "Ma On Shan", name_zh: "馬鞍山" },
      { code: "WKS", name_en: "Wu Kai Sha", name_zh: "烏溪沙" },
    ],
  },
  {
    code: "TWL", name_en: "Tsuen Wan Line", name_zh: "荃灣線", color: "hsl(357 80% 46%)",
    stations: [
      { code: "CEN", name_en: "Central", name_zh: "中環" },
      { code: "ADM", name_en: "Admiralty", name_zh: "金鐘" },
      { code: "TST", name_en: "Tsim Sha Tsui", name_zh: "尖沙咀" },
      { code: "JOR", name_en: "Jordan", name_zh: "佐敦" },
      { code: "MOK", name_en: "Mong Kok", name_zh: "旺角" },
      { code: "PRE", name_en: "Prince Edward", name_zh: "太子" },
      { code: "SSP", name_en: "Sham Shui Po", name_zh: "深水埗" },
      { code: "CSW", name_en: "Cheung Sha Wan", name_zh: "長沙灣" },
      { code: "LCK", name_en: "Lai Chi Kok", name_zh: "荔枝角" },
      { code: "KWH", name_en: "Kwai Hing", name_zh: "葵興" },
      { code: "KWF", name_en: "Kwai Fong", name_zh: "葵芳" },
      { code: "LAK", name_en: "Lai King", name_zh: "荔景" },
      { code: "TSW", name_en: "Tsuen Wan", name_zh: "荃灣" },
    ],
  },
  {
    code: "KTL", name_en: "Kwun Tong Line", name_zh: "觀塘線", color: "hsl(71 72% 35%)",
    stations: [
      { code: "WHA", name_en: "Whampoa", name_zh: "黃埔" },
      { code: "HOM", name_en: "Ho Man Tin", name_zh: "何文田" },
      { code: "YMT", name_en: "Yau Ma Tei", name_zh: "油麻地" },
      { code: "MOK", name_en: "Mong Kok", name_zh: "旺角" },
      { code: "PRE", name_en: "Prince Edward", name_zh: "太子" },
      { code: "SKM", name_en: "Shek Kip Mei", name_zh: "石硤尾" },
      { code: "KOT", name_en: "Kowloon Tong", name_zh: "九龍塘" },
      { code: "LOF", name_en: "Lok Fu", name_zh: "樂富" },
      { code: "WTS", name_en: "Wong Tai Sin", name_zh: "黃大仙" },
      { code: "DIH", name_en: "Diamond Hill", name_zh: "鑽石山" },
      { code: "CHH", name_en: "Choi Hung", name_zh: "彩虹" },
      { code: "KOB", name_en: "Kowloon Bay", name_zh: "九龍灣" },
      { code: "NTK", name_en: "Ngau Tau Kok", name_zh: "牛頭角" },
      { code: "KWT", name_en: "Kwun Tong", name_zh: "觀塘" },
      { code: "LAT", name_en: "Lam Tin", name_zh: "藍田" },
      { code: "TIK", name_en: "Tiu Keng Leng", name_zh: "調景嶺" },
    ],
  },
  {
    code: "ISL", name_en: "Island Line", name_zh: "港島線", color: "hsl(214 88% 51%)",
    stations: [
      { code: "KET", name_en: "Kennedy Town", name_zh: "堅尼地城" },
      { code: "HKU", name_en: "HKU", name_zh: "香港大學" },
      { code: "SYP", name_en: "Sai Ying Pun", name_zh: "西營盤" },
      { code: "SHW", name_en: "Sheung Wan", name_zh: "上環" },
      { code: "CEN", name_en: "Central", name_zh: "中環" },
      { code: "ADM", name_en: "Admiralty", name_zh: "金鐘" },
      { code: "WAC", name_en: "Wan Chai", name_zh: "灣仔" },
      { code: "CAB", name_en: "Causeway Bay", name_zh: "銅鑼灣" },
      { code: "TIH", name_en: "Tin Hau", name_zh: "天后" },
      { code: "FOH", name_en: "Fortress Hill", name_zh: "炮台山" },
      { code: "NOP", name_en: "North Point", name_zh: "北角" },
      { code: "QUB", name_en: "Quarry Bay", name_zh: "鰂魚涌" },
      { code: "TAK", name_en: "Tai Koo", name_zh: "太古" },
      { code: "SWH", name_en: "Sai Wan Ho", name_zh: "西灣河" },
      { code: "SKW", name_en: "Shau Kei Wan", name_zh: "筲箕灣" },
      { code: "HFC", name_en: "Heng Fa Chuen", name_zh: "杏花邨" },
      { code: "CHW", name_en: "Chai Wan", name_zh: "柴灣" },
    ],
  },
  {
    code: "EAL", name_en: "East Rail Line", name_zh: "東鐵線", color: "hsl(21 80% 45%)",
    stations: [
      { code: "ADM", name_en: "Admiralty", name_zh: "金鐘" },
      { code: "EXC", name_en: "Exhibition Centre", name_zh: "會展" },
      { code: "HUH", name_en: "Hung Hom", name_zh: "紅磡" },
      { code: "MKK", name_en: "Mong Kok East", name_zh: "旺角東" },
      { code: "KOT", name_en: "Kowloon Tong", name_zh: "九龍塘" },
      { code: "TAW", name_en: "Tai Wai", name_zh: "大圍" },
      { code: "SHT", name_en: "Sha Tin", name_zh: "沙田" },
      { code: "FOT", name_en: "Fo Tan", name_zh: "火炭" },
      { code: "RAC", name_en: "Racecourse", name_zh: "馬場" },
      { code: "UNI", name_en: "University", name_zh: "大學" },
      { code: "TAP", name_en: "Tai Po Market", name_zh: "大埔墟" },
      { code: "TWO", name_en: "Tai Wo", name_zh: "太和" },
      { code: "FAN", name_en: "Fanling", name_zh: "粉嶺" },
      { code: "SHS", name_en: "Sheung Shui", name_zh: "上水" },
      { code: "LOW", name_en: "Lo Wu", name_zh: "羅湖" },
      { code: "LMC", name_en: "Lok Ma Chau", name_zh: "落馬洲" },
    ],
  },
  {
    code: "TKL", name_en: "Tseung Kwan O Line", name_zh: "將軍澳線", color: "hsl(282 55% 53%)",
    stations: [
      { code: "NOP", name_en: "North Point", name_zh: "北角" },
      { code: "QUB", name_en: "Quarry Bay", name_zh: "鰂魚涌" },
      { code: "YAT", name_en: "Yau Tong", name_zh: "油塘" },
      { code: "TIK", name_en: "Tiu Keng Leng", name_zh: "調景嶺" },
      { code: "TKO", name_en: "Tseung Kwan O", name_zh: "將軍澳" },
      { code: "HAH", name_en: "Hang Hau", name_zh: "坑口" },
      { code: "POA", name_en: "Po Lam", name_zh: "寶琳" },
      { code: "LHP", name_en: "LOHAS Park", name_zh: "日出康城" },
    ],
  },
  {
    code: "SIL", name_en: "South Island Line", name_zh: "南港島線", color: "hsl(156 72% 31%)",
    stations: [
      { code: "ADM", name_en: "Admiralty", name_zh: "金鐘" },
      { code: "OCP", name_en: "Ocean Park", name_zh: "海洋公園" },
      { code: "WCH", name_en: "Wong Chuk Hang", name_zh: "黃竹坑" },
      { code: "LET", name_en: "Lei Tung", name_zh: "利東" },
      { code: "SOK", name_en: "South Horizons", name_zh: "海怡半島" },
    ],
  },
  {
    code: "DRL", name_en: "Disneyland Resort Line", name_zh: "迪士尼線", color: "hsl(324 71% 59%)",
    stations: [
      { code: "SUN", name_en: "Sunny Bay", name_zh: "欣澳" },
      { code: "DIS", name_en: "Disneyland Resort", name_zh: "迪士尼" },
    ],
  },
];

export const MTR_LINE_MAP: Record<string, MtrLine> = Object.fromEntries(
  MTR_LINES.map((l) => [l.code, l])
);

// Flat lookup: station code → names (deduped across lines, first occurrence wins)
export const MTR_STATION_MAP: Record<string, { name_en: string; name_zh: string }> = (() => {
  const map: Record<string, { name_en: string; name_zh: string }> = {};
  for (const line of MTR_LINES) {
    for (const sta of line.stations) {
      if (!map[sta.code]) {
        map[sta.code] = { name_en: sta.name_en, name_zh: sta.name_zh };
      }
    }
  }
  return map;
})();
