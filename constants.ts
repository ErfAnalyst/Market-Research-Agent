import { CompetitorRow, PersonnelRow } from './types';

export const SYSTEM_INSTRUCTION = `
ROLE
You are the Lead Market Research Scientist for the DFW Dental Market. Your mission is to provide "Data-Hardened" competitive intelligence for our internal entity, AD&I/DDS (always combined), by uncovering bundled pricing, verifying provider capacity, and integrating human-verified data.

PRIMARY DIRECTIVE: BUNDLE DISCOVERY & HARDENING
1. Search Protocol: Simulate a deep-scrape of DSO websites, Reviews, and YouTube for "Marketed Bundles".
2. Bundle Identification: Categorize prices as "Bundle" or "A-la-carte."
3. Consolidation: AD&I and DDS are the same company. Always list them as a single "Internal" entry.

OUTPUT FORMAT
Return ONLY valid JSON with two arrays: "competitors" and "personnel".
`;

export const INITIAL_COMPETITORS: CompetitorRow[] = [
  {
    id: 'internal',
    name: 'AD&I/DDS (Internal)',
    geoFocus: 'DFW Metroplex',
    totalDentists: 14,
    totalClinics: 8,
    dentistsPerClinic: 1.75,
    implantSpecialists: 4,
    economyDenture: '$595',
    econPackageLow: '$4,500',
    econPackageHigh: '$12,000',
    pricingSource: 'Internal Ledger',
    isLocked: {},
  },
  {
    id: 'comp1',
    name: 'ClearChoice',
    geoFocus: 'North Dallas',
    totalDentists: 6,
    totalClinics: 2,
    dentistsPerClinic: 3,
    implantSpecialists: 6,
    economyDenture: 'N/A',
    econPackageLow: '$22,000',
    econPackageHigh: '$28,000',
    pricingSource: 'Website Promo 2024',
    isLocked: {},
  },
];

export const INITIAL_PERSONNEL: PersonnelRow[] = [
  {
    id: 'internal',
    name: 'AD&I/DDS (Internal)',
    specialistNames: 'Dr. Smith, Dr. Jones, Dr. Lee, Dr. Patel',
    generalDentistNames: 'Dr. A, Dr. B, Dr. C...',
    formulaSum: 18,
    source: 'Internal HR',
    isLocked: {},
  },
];

export const MODEL_THINKING = 'gemini-3-pro-preview';
export const MODEL_FLASH = 'gemini-2.5-flash';
export const MODEL_FLASH_LITE = 'gemini-2.5-flash-lite'; // Corrected from gemini-flash-lite-latest based on request or standard aliases
export const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
export const MODEL_IMAGE_GEN = 'gemini-3-pro-image-preview';
export const MODEL_VIDEO = 'gemini-3-pro-preview';
