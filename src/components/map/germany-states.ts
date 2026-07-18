export interface GermanState {
  id: string;
  label: string;
  path: string;
}

/**
 * Simplified SVG paths for the 16 German Bundesländer.
 * viewBox: 0 0 580 800
 * Approximate geographic layout, not survey-accurate.
 */
export const STATES: GermanState[] = [
  {
    id: "Schleswig-Holstein",
    label: "Schleswig-Holstein",
    path: "M260,20 L310,10 L340,30 L350,70 L330,120 L300,130 L270,110 L250,70 Z",
  },
  {
    id: "Hamburg",
    label: "Hamburg",
    path: "M285,120 L310,115 L320,135 L305,145 L285,140 Z",
  },
  {
    id: "Niedersachsen",
    label: "Niedersachsen",
    path: "M180,130 L250,120 L280,130 L310,140 L340,130 L360,170 L350,220 L330,260 L300,280 L270,300 L240,310 L210,300 L190,280 L170,250 L160,210 L170,170 Z",
  },
  {
    id: "Bremen",
    label: "Bremen",
    path: "M220,195 L240,190 L245,210 L230,215 L220,205 Z",
  },
  {
    id: "Mecklenburg-Vorpommern",
    label: "Mecklenburg-Vorpommern",
    path: "M340,30 L410,20 L470,30 L510,50 L520,90 L500,130 L460,140 L420,130 L380,120 L350,100 L340,70 Z",
  },
  {
    id: "Brandenburg",
    label: "Brandenburg",
    path: "M350,130 L420,130 L460,140 L490,160 L500,200 L490,250 L470,280 L440,300 L400,310 L370,300 L350,270 L340,230 L340,190 L350,160 Z",
  },
  {
    id: "Berlin",
    label: "Berlin",
    path: "M440,180 L465,175 L470,200 L460,215 L440,210 L435,190 Z",
  },
  {
    id: "Sachsen-Anhalt",
    label: "Sachsen-Anhalt",
    path: "M340,190 L380,180 L400,190 L430,200 L440,230 L430,270 L400,290 L370,300 L340,280 L330,250 L330,220 Z",
  },
  {
    id: "Sachsen",
    label: "Sachsen",
    path: "M430,270 L470,260 L510,270 L530,300 L520,340 L500,370 L470,380 L440,370 L420,350 L410,320 L420,290 Z",
  },
  {
    id: "Thüringen",
    label: "Thüringen",
    path: "M340,300 L380,290 L410,300 L420,330 L410,360 L390,380 L360,390 L330,380 L310,360 L310,330 L320,310 Z",
  },
  {
    id: "Hessen",
    label: "Hessen",
    path: "M240,310 L290,300 L320,310 L330,340 L320,380 L310,410 L290,430 L260,440 L240,420 L230,390 L230,350 Z",
  },
  {
    id: "Nordrhein-Westfalen",
    label: "Nordrhein-Westfalen",
    path: "M130,250 L180,240 L210,250 L240,270 L250,300 L240,330 L220,350 L190,360 L160,350 L130,330 L110,300 L110,270 Z",
  },
  {
    id: "Rheinland-Pfalz",
    label: "Rheinland-Pfalz",
    path: "M120,360 L170,350 L200,360 L230,380 L240,420 L230,460 L210,490 L180,510 L150,500 L120,480 L100,450 L90,410 L100,380 Z",
  },
  {
    id: "Saarland",
    label: "Saarland",
    path: "M100,480 L130,470 L145,490 L140,520 L120,530 L100,515 Z",
  },
  {
    id: "Baden-Württemberg",
    label: "Baden-Württemberg",
    path: "M150,500 L200,490 L240,500 L280,510 L310,530 L320,570 L310,610 L280,640 L250,650 L210,640 L180,620 L150,590 L140,550 L140,520 Z",
  },
  {
    id: "Bayern",
    label: "Bayern",
    path: "M280,430 L330,410 L380,400 L430,410 L480,430 L520,460 L540,510 L530,560 L510,610 L480,650 L440,680 L400,690 L360,680 L320,660 L290,630 L270,590 L260,540 L270,490 L270,460 Z",
  },
];

/**
 * Normalization map: lebensmittelwarnung.de state names → SVG state IDs.
 * The site uses full German names; some may differ slightly.
 */
export const STATE_NORMALIZATION: Record<string, string> = {
  "Baden-Württemberg": "Baden-Württemberg",
  "Baden-Wuerttemberg": "Baden-Württemberg",
  Bayern: "Bayern",
  "Freistaat Bayern": "Bayern",
  Berlin: "Berlin",
  Brandenburg: "Brandenburg",
  Bremen: "Bremen",
  Hamburg: "Hamburg",
  Hessen: "Hessen",
  "Mecklenburg-Vorpommern": "Mecklenburg-Vorpommern",
  Niedersachsen: "Niedersachsen",
  "Nordrhein-Westfalen": "Nordrhein-Westfalen",
  NRW: "Nordrhein-Westfalen",
  "Rheinland-Pfalz": "Rheinland-Pfalz",
  Saarland: "Saarland",
  Sachsen: "Sachsen",
  "Sachsen-Anhalt": "Sachsen-Anhalt",
  "Schleswig-Holstein": "Schleswig-Holstein",
  "Thüringen": "Thüringen",
  Thueringen: "Thüringen",
};

export function normalizeState(name: string): string {
  return STATE_NORMALIZATION[name] ?? name;
}
