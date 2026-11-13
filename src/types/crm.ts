/**
 * Dooz Client Anthropometric CRM Types & Constants
 * Defines the 26-measurement tailoring schema, posture defect tags, and studio bridge interfaces.
 */

export type PostureTag =
  | 'PROMINENT_ABDOMEN'
  | 'SWAYBACK'
  | 'PROMINENT_HIP'
  | 'FLAT_BUTTOCKS'
  | 'SLOPING_SHOULDERS'
  | 'SQUARE_SHOULDERS'
  | 'ROUND_BACK'
  | 'PIGEON_CHEST';

export const ALLOWED_POSTURE_TAGS: PostureTag[] = [
  'PROMINENT_ABDOMEN',
  'SWAYBACK',
  'PROMINENT_HIP',
  'FLAT_BUTTOCKS',
  'SLOPING_SHOULDERS',
  'SQUARE_SHOULDERS',
  'ROUND_BACK',
  'PIGEON_CHEST',
];

export const POSTURE_TAG_LABELS_FA: Record<PostureTag, string> = {
  PROMINENT_ABDOMEN: 'شکم برجسته',
  SWAYBACK: 'گودی کمر (لوردوز)',
  PROMINENT_HIP: 'باسن برجسته',
  FLAT_BUTTOCKS: 'باسن تخت',
  SLOPING_SHOULDERS: 'افتادگی شانه',
  SQUARE_SHOULDERS: 'سرشانه صاف و مستطیلی',
  ROUND_BACK: 'قوز / گردی پشت',
  PIGEON_CHEST: 'سینه کبوتری و برجسته',
};

export interface AnthropometricMeasurements {
  totalHeight: number;           // 100 - 230 cm (Required)
  bustCircumference: number;     // 60 - 160 cm (Required)
  waistCircumference: number;    // 45 - 140 cm (Required)
  hipCircumference: number;      // 60 - 170 cm (Required)
  highHipCircumference?: number; // 55 - 150 cm (Optional)
  acrossBack: number;            // 25 - 50 cm (Required)
  acrossFront: number;           // 25 - 50 cm (Required)
  shoulderLength: number;        // 8 - 20 cm (Required)
  neckCircumference: number;     // 25 - 55 cm (Required)
  bustDistance: number;          // 12 - 30 cm (Required)
  backWaistLength: number;       // 30 - 55 cm (Required)
  frontWaistLength: number;      // 30 - 60 cm (Required)
  bustHeight: number;            // 18 - 40 cm (Required)
  armholeDepth: number;          // 14 - 32 cm (Required)
  hipHeight: number;             // 15 - 28 cm (Required)
  sleeveLength: number;          // 40 - 75 cm (Required)
  bicepCircumference: number;    // 18 - 55 cm (Required)
  wristCircumference: number;    // 12 - 26 cm (Required)
  elbowCircumference?: number;   // 16 - 36 cm (Optional)
  skirtLength?: number;          // 30 - 120 cm (Optional)
  trouserOutseam: number;        // 70 - 130 cm (Required)
  trouserInseam: number;         // 50 - 95 cm (Required)
  crotchDepth: number;           // 18 - 38 cm (Required)
  thighCircumference: number;    // 35 - 85 cm (Required)
  kneeCircumference: number;     // 25 - 60 cm (Required)
  ankleCircumference: number;    // 16 - 35 cm (Required)
  [key: string]: number | undefined;
}

export const REQUIRED_MEASUREMENT_FIELDS: (keyof AnthropometricMeasurements)[] = [
  'totalHeight',
  'bustCircumference',
  'waistCircumference',
  'hipCircumference',
  'acrossBack',
  'acrossFront',
  'shoulderLength',
  'neckCircumference',
  'bustDistance',
  'backWaistLength',
  'frontWaistLength',
  'bustHeight',
  'armholeDepth',
  'hipHeight',
  'sleeveLength',
  'bicepCircumference',
  'wristCircumference',
  'trouserOutseam',
  'trouserInseam',
  'crotchDepth',
  'thighCircumference',
  'kneeCircumference',
  'ankleCircumference',
];

export interface MeasurementFieldMeta {
  key: keyof AnthropometricMeasurements;
  labelFa: string;
  category: 'CORE' | 'UPPER_BODY' | 'SLEEVE' | 'TROUSER' | 'SKIRT';
  min: number;
  max: number;
  defaultVal: number;
  required: boolean;
}

export const MEASUREMENT_FIELDS_METADATA: MeasurementFieldMeta[] = [
  { key: 'totalHeight', labelFa: 'قد کل ایستاده', category: 'CORE', min: 100, max: 230, defaultVal: 168, required: true },
  { key: 'bustCircumference', labelFa: 'دور سینه', category: 'CORE', min: 60, max: 160, defaultVal: 88, required: true },
  { key: 'waistCircumference', labelFa: 'دور کمر', category: 'CORE', min: 45, max: 140, defaultVal: 70, required: true },
  { key: 'hipCircumference', labelFa: 'دور باسن بزرگ', category: 'CORE', min: 60, max: 170, defaultVal: 94, required: true },
  { key: 'highHipCircumference', labelFa: 'دور باسن کوچک', category: 'CORE', min: 55, max: 150, defaultVal: 85, required: false },
  { key: 'hipHeight', labelFa: 'بلندی خط باسن', category: 'CORE', min: 15, max: 28, defaultVal: 20, required: true },
  { key: 'acrossBack', labelFa: 'کارور پشت', category: 'UPPER_BODY', min: 25, max: 50, defaultVal: 34.5, required: true },
  { key: 'acrossFront', labelFa: 'کارور جلو', category: 'UPPER_BODY', min: 25, max: 50, defaultVal: 32.0, required: true },
  { key: 'shoulderLength', labelFa: 'طول سرشانه', category: 'UPPER_BODY', min: 8, max: 20, defaultVal: 12.5, required: true },
  { key: 'neckCircumference', labelFa: 'دور طوق گردن', category: 'UPPER_BODY', min: 25, max: 55, defaultVal: 36.0, required: true },
  { key: 'bustDistance', labelFa: 'فاصله دو نوک سینه', category: 'UPPER_BODY', min: 12, max: 30, defaultVal: 18.5, required: true },
  { key: 'backWaistLength', labelFa: 'قد بالاتنه پشت', category: 'UPPER_BODY', min: 30, max: 55, defaultVal: 41.0, required: true },
  { key: 'frontWaistLength', labelFa: 'قد بالاتنه جلو', category: 'UPPER_BODY', min: 30, max: 60, defaultVal: 43.5, required: true },
  { key: 'bustHeight', labelFa: 'بلندی سینه', category: 'UPPER_BODY', min: 18, max: 40, defaultVal: 26.5, required: true },
  { key: 'armholeDepth', labelFa: 'بلندی کف حلقه آستین', category: 'UPPER_BODY', min: 14, max: 32, defaultVal: 20.0, required: true },
  { key: 'sleeveLength', labelFa: 'قد آستین', category: 'SLEEVE', min: 40, max: 75, defaultVal: 58.0, required: true },
  { key: 'bicepCircumference', labelFa: 'دور بازو', category: 'SLEEVE', min: 18, max: 55, defaultVal: 27.5, required: true },
  { key: 'wristCircumference', labelFa: 'دور مچ', category: 'SLEEVE', min: 12, max: 26, defaultVal: 16.0, required: true },
  { key: 'elbowCircumference', labelFa: 'دور آرنج', category: 'SLEEVE', min: 16, max: 36, defaultVal: 24.5, required: false },
  { key: 'skirtLength', labelFa: 'قد دامن دلخواه', category: 'SKIRT', min: 30, max: 120, defaultVal: 65.0, required: false },
  { key: 'trouserOutseam', labelFa: 'قد شلوار از پهلو', category: 'TROUSER', min: 70, max: 130, defaultVal: 102.0, required: true },
  { key: 'trouserInseam', labelFa: 'قد داخل پا (فاق تا مچ)', category: 'TROUSER', min: 50, max: 95, defaultVal: 76.0, required: true },
  { key: 'crotchDepth', labelFa: 'بلندی فاق', category: 'TROUSER', min: 18, max: 38, defaultVal: 26.0, required: true },
  { key: 'thighCircumference', labelFa: 'دور ران', category: 'TROUSER', min: 35, max: 85, defaultVal: 55.0, required: true },
  { key: 'kneeCircumference', labelFa: 'دور زانو', category: 'TROUSER', min: 25, max: 60, defaultVal: 38.0, required: true },
  { key: 'ankleCircumference', labelFa: 'دور مچ پا', category: 'TROUSER', min: 16, max: 35, defaultVal: 24.0, required: true },
];

export interface ClientProfileData {
  id: string;
  tailorId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  gender: 'FEMALE' | 'MALE';
  measurements: AnthropometricMeasurements;
  postureTags: PostureTag[];
  fitPreference: 'TIGHT' | 'CLASSIC' | 'LOOSE';
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  savedDrafts?: any[];
}

export interface ClientStudioBridgePayload {
  clientId: string;
  fullName: string;
  measurements: AnthropometricMeasurements;
  postureTags: PostureTag[];
  fitPreference: 'TIGHT' | 'CLASSIC' | 'LOOSE';
  notes?: string | null;
}

/**
 * Validates anthropometric measurements against required fields and human bounds.
 */
export function validateAnthropometricMeasurements(measurements: Record<string, any>): { valid: boolean; error?: string } {
  for (const field of REQUIRED_MEASUREMENT_FIELDS) {
    if (measurements[field] === undefined || measurements[field] === null) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
    const val = Number(measurements[field]);
    if (isNaN(val) || val <= 0) {
      return { valid: false, error: `Field ${field} must be a positive number` };
    }
  }

  const height = Number(measurements.totalHeight);
  if (height < 100 || height > 230) {
    return { valid: false, error: 'قد باید بین ۱۰۰ تا ۲۳۰ سانتی‌متر باشد' };
  }

  const bust = Number(measurements.bustCircumference);
  if (bust < 60 || bust > 160) {
    return { valid: false, error: 'دور سینه نامعتبر است' };
  }

  return { valid: true };
}

/**
 * Sanitizes posture defect tags: deduplicates and resolves mutual exclusions.
 * If both SLOPING_SHOULDERS and SQUARE_SHOULDERS are present, resolves to SQUARE_SHOULDERS.
 */
export function sanitizePostureTags(tags: unknown): PostureTag[] {
  if (!Array.isArray(tags)) return [];
  const unique = [...new Set(tags.filter((t): t is PostureTag => ALLOWED_POSTURE_TAGS.includes(t as PostureTag)))];
  const hasSloping = unique.includes('SLOPING_SHOULDERS');
  const hasSquare = unique.includes('SQUARE_SHOULDERS');
  if (hasSloping && hasSquare) {
    return unique.filter((t) => t !== 'SLOPING_SHOULDERS');
  }
  return unique;
}
