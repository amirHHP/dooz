/**
 * Dooz Two-Sided Pattern Marketplace Types & Fabric Consumption Calculator
 */

export type ProductCategory =
  | 'TOPS_BLOUSES'
  | 'DRESSES'
  | 'OUTERWEAR'
  | 'SKIRTS'
  | 'TROUSERS';

export const CATEGORY_LABELS_FA: Record<ProductCategory, string> = {
  TOPS_BLOUSES: 'شومیز و بلوز',
  DRESSES: 'پیراهن مجلسی و روزمره',
  OUTERWEAR: 'مانتو، پالتو و بارانی',
  SKIRTS: 'دامن',
  TROUSERS: 'شلوار',
};

export type PatternDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'MASTER';

export const DIFFICULTY_LABELS_FA: Record<PatternDifficulty, string> = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
  MASTER: 'استادکار',
};

export type FitFeedbackEnum = 'RUNS_SMALL' | 'TRUE_TO_SIZE' | 'RUNS_LARGE';

export const FIT_FEEDBACK_LABELS_FA: Record<FitFeedbackEnum, string> = {
  RUNS_SMALL: 'کوچک‌تر از اندازه (جذب)',
  TRUE_TO_SIZE: 'مطابق اندازه واقعی',
  RUNS_LARGE: 'بزرگ‌تر از اندازه (آزاد)',
};

export type FabricPatternType = 'SOLID' | 'ONE_WAY' | 'VELVET' | 'PLAID' | 'STRIPES';

export interface FabricCalculationParams {
  bodiceLength?: number;
  skirtLength?: number;
  sleeveLength?: number;
  size?: number;
  fabricWidth?: 110 | 150 | number;
  fabricPattern?: FabricPatternType | string;
  allowanceCm?: number;
}

export interface FabricCalculationResult {
  fabricWidth: number;
  fabricPattern: FabricPatternType | string;
  size: number;
  baseLengthCm: number;
  patternMultiplier: number;
  finalLengthCm: number;
  finalMeters: number;
  layoutType: 'PARALLEL' | 'STACKED';
  warning: string | null;
  wastagePercentage: number;
}

/**
 * Deterministic fabric consumption algorithm matching tests/harness/fabric-math.mjs exactly.
 */
export function calculateFabricConsumption(params: FabricCalculationParams = {}): FabricCalculationResult {
  const {
    bodiceLength = 42,
    skirtLength = 65,
    sleeveLength = 60,
    size = 40,
    fabricWidth = 150,
    fabricPattern = 'SOLID',
    allowanceCm = 20,
  } = params;

  // Determine nap / pattern multiplier
  let patternMultiplier = 1.0;
  if (fabricPattern === 'ONE_WAY' || fabricPattern === 'VELVET') {
    patternMultiplier = 1.15; // +15%
  } else if (fabricPattern === 'PLAID' || fabricPattern === 'STRIPES') {
    patternMultiplier = 1.20; // +20%
  }

  // Base lengths in cm
  const isWide = fabricWidth >= 140;
  const isLargeSize = size >= 48;

  let baseLengthCm = 0;
  let layoutType: 'PARALLEL' | 'STACKED' = 'PARALLEL';
  let warning: string | null = null;

  if (isWide) {
    // 150cm roll: front and back panels can generally nest side-by-side
    baseLengthCm = bodiceLength + skirtLength + sleeveLength + allowanceCm;
    if (isLargeSize) {
      baseLengthCm += 15;
    }
  } else {
    // 110cm roll: narrow bolt cannot nest side-by-side
    if (isLargeSize) {
      layoutType = 'STACKED';
      // Front and back panels must be stacked completely vertically
      baseLengthCm = (bodiceLength * 2) + (skirtLength * 2) + sleeveLength + allowanceCm + 15;
      warning = 'نیاز به چیدمان متوالی (Stacked Layout) به دلیل عرض کم پارچه و سایز بالا';
    } else {
      // Moderate size on 110cm: Ratio ~1.55x compared to 150cm roll
      const wideBase = bodiceLength + skirtLength + sleeveLength + allowanceCm;
      baseLengthCm = wideBase * 1.55;
    }
  }

  const finalLengthCm = Math.round(baseLengthCm * patternMultiplier);
  const finalMeters = Math.max(0.5, Number((finalLengthCm / 100).toFixed(2)));

  return {
    fabricWidth,
    fabricPattern,
    size,
    baseLengthCm,
    patternMultiplier,
    finalLengthCm,
    finalMeters,
    layoutType,
    warning,
    wastagePercentage: isWide ? 12 : 18,
  };
}

export interface PatternStepData {
  id: string;
  stepOrder: number;
  title: string;
  description: string;
  illustrationUrl?: string | null;
  technicalDetails?: any;
}

export interface ReviewData {
  id: string;
  userId: string;
  patternId: string;
  rating: number;
  fitFeedback: FitFeedbackEnum | string;
  title?: string | null;
  comment: string;
  createdAt: string | Date;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isVerifiedPurchase?: boolean;
}

export interface MarketplacePattern {
  id: string;
  creatorId: string;
  title: string;
  slug: string;
  description: string;
  category: ProductCategory | string;
  baseBlock?: string | null;
  draftingMethod: 'MULLER' | 'METRIC' | 'GRLAWEIN' | string;
  fitType: 'TIGHT' | 'CLASSIC' | 'LOOSE' | string;
  difficulty: PatternDifficulty | string;
  price: number; // In Toman (0 = Free)
  coverImage: string;
  galleryImages: string[];
  technicalFlatFront: string;
  technicalFlatBack: string;
  fabricRequirements?: any;
  attachmentType?: string;
  isPublished?: boolean;
  salesCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  creator?: {
    id: string;
    name?: string | null;
    email?: string | null;
    bio?: string | null;
  };
  steps?: PatternStepData[];
  reviews?: ReviewData[];
  _count?: {
    reviews?: number;
    purchases?: number;
  };
}

export interface MarketplaceFilterQuery {
  category?: string;
  method?: string;
  difficulty?: string;
  fitType?: string;
  isFree?: boolean;
  maxPrice?: number;
  q?: string;
}

export const SEEDED_PATTERNS: MarketplacePattern[] = [
  {
    id: 'pat-001',
    creatorId: 'creator-mahsa',
    title: 'مانتو کتی کلاسیک با یقه انگلیسی',
    slug: 'classic-tailored-blazer-coat',
    description: 'مانتو کتی کلاسیک مزونی با یقه انگلیسی استاندارد، جیب فیلتابی دوطرفه و آستین دوتکه متناسب.',
    category: 'OUTERWEAR',
    baseBlock: 'BODICE',
    draftingMethod: 'MULLER',
    fitType: 'CLASSIC',
    difficulty: 'ADVANCED',
    price: 350000,
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000',
    galleryImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
    ],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
      bio: 'مدرس طراحی الگو و مدلسازی به روش مولر آلمان',
    },
  },
  {
    id: 'pat-002',
    creatorId: 'creator-mahsa',
    title: 'پیراهن مجلسی برش پرنسسی با دامن فون',
    slug: 'princess-seam-evening-dress',
    description: 'پیراهن شب با برش پرنسسی از سرشانه تا لبه دامن و فرم فون برای وقار اندام.',
    category: 'DRESSES',
    baseBlock: 'BODICE',
    draftingMethod: 'METRIC',
    fitType: 'TIGHT',
    difficulty: 'MASTER',
    price: 420000,
    coverImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
  {
    id: 'pat-003',
    creatorId: 'creator-mahsa',
    title: 'شومیز آستین پفی و یقه شکاری',
    slug: 'bishop-sleeve-blouse',
    description: 'شومیز زنانه با آستین بیشاپ پف‌دار، مچ‌دار با دکمه و یقه شکاری سرخود.',
    category: 'TOPS_BLOUSES',
    baseBlock: 'BODICE',
    draftingMethod: 'METRIC',
    fitType: 'CLASSIC',
    difficulty: 'INTERMEDIATE',
    price: 180000,
    coverImage: 'https://images.unsplash.com/photo-1589310243389-968d74870e61?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
  {
    id: 'pat-004',
    creatorId: 'creator-mahsa',
    title: 'شلوار راسته زنانه با خط اتو و جیب فیلتابی',
    slug: 'classic-straight-leg-trousers',
    description: 'شلوار کلاسیک اداری راسته با خط اتوی مرکزی و ساسون‌های متناسب پشت.',
    category: 'TROUSERS',
    baseBlock: 'TROUSER',
    draftingMethod: 'MULLER',
    fitType: 'CLASSIC',
    difficulty: 'INTERMEDIATE',
    price: 220000,
    coverImage: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
  {
    id: 'pat-005',
    creatorId: 'creator-mahsa',
    title: 'دامن فون کلاسیک چهار تکه',
    slug: 'a-line-4-panel-skirt',
    description: 'دامن فون پایه ۴ تکه با اوزمان ۴ سانتی‌متری، مناسب دوزندگان مبتدی.',
    category: 'SKIRTS',
    baseBlock: 'SKIRT',
    draftingMethod: 'GRLAWEIN',
    fitType: 'CLASSIC',
    difficulty: 'BEGINNER',
    price: 0, // Free
    coverImage: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
  {
    id: 'pat-006',
    creatorId: 'creator-mahsa',
    title: 'پیراهن ماکسی چین‌دار تابستانه با یقه قایقی',
    slug: 'tiered-summer-maxi-dress',
    description: 'پیراهن تابستانه خنک چند طبقه چین‌دار با یقه قایقی راحت.',
    category: 'DRESSES',
    baseBlock: 'BODICE',
    draftingMethod: 'GRLAWEIN',
    fitType: 'LOOSE',
    difficulty: 'BEGINNER',
    price: 120000,
    coverImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
  {
    id: 'pat-007',
    creatorId: 'creator-mahsa',
    title: 'بارانی ترنچ کژوال با آستین رگلان و کمربند',
    slug: 'casual-raglan-trench-coat',
    description: 'بارانی ترنچ کژوال پاییزه با آستین رگلان آزاد، جیب‌های دوطرفه و بند مچ دست.',
    category: 'OUTERWEAR',
    baseBlock: 'BODICE',
    draftingMethod: 'MULLER',
    fitType: 'LOOSE',
    difficulty: 'ADVANCED',
    price: 390000,
    coverImage: 'https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
  {
    id: 'pat-008',
    creatorId: 'creator-mahsa',
    title: 'شلوار واید لگ فاق بلند با پیلی دوقلو',
    slug: 'high-waisted-wide-leg-pants',
    description: 'شلوار واید لگ مد روز با کمر پهن، پیلی دوقلوی جلو و پاچه‌های گشاد.',
    category: 'TROUSERS',
    baseBlock: 'TROUSER',
    draftingMethod: 'METRIC',
    fitType: 'LOOSE',
    difficulty: 'INTERMEDIATE',
    price: 260000,
    coverImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1000',
    galleryImages: [],
    technicalFlatFront: '',
    technicalFlatBack: '',
    creator: {
      id: 'creator-mahsa',
      name: 'مهسا رادمنش',
    },
  },
];

