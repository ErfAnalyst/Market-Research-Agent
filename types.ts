export interface CompetitorRow {
  id: string;
  name: string;
  geoFocus: string;
  totalDentists: number | string;
  totalClinics: number | string;
  dentistsPerClinic: number | string;
  implantSpecialists: number | string;
  economyDenture: string;
  econPackageLow: string;
  econPackageHigh: string;
  pricingSource: string;
  isLocked: Record<string, boolean>; // Keyed by column name
}

export interface PersonnelRow {
  id: string;
  name: string;
  specialistNames: string;
  generalDentistNames: string;
  formulaSum: number | string;
  source: string;
  isLocked: Record<string, boolean>;
}

export interface MarketData {
  competitors: CompetitorRow[];
  personnel: PersonnelRow[];
}

export enum Tab {
  MATRIX = 'MATRIX',
  PERSONNEL = 'PERSONNEL',
  TOOLS = 'TOOLS',
}

export enum AspectRatio {
  RATIO_1_1 = '1:1',
  RATIO_3_4 = '3:4',
  RATIO_4_3 = '4:3',
  RATIO_9_16 = '9:16',
  RATIO_16_9 = '16:9',
  RATIO_2_3 = '2:3',
  RATIO_3_2 = '3:2',
  RATIO_21_9 = '21:9',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        text: string;
      }[];
    }[];
  };
}