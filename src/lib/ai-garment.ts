/**
 * Dooz (دوز) — AI Garment Reverse-Engineering Engine
 * Google Gemini 1.5 Flash Vision Multimodal Integration
 * with Zero-Crash Deterministic Heuristic Fallback & Studio Deep-Linking.
 */

export interface GarmentSilhouette {
  type: string;
  persianName: string;
  description: string;
}

export interface GarmentNeckline {
  type: string;
  collarType?: string;
  facingWidthCm: number;
  instructions?: string;
}

export interface GarmentSleeves {
  type: string;
  persianName: string;
  capHeightAdjustment?: string;
  cuffType?: string;
}

export interface GarmentDartsAndPleats {
  frontDarts: string[];
  backDarts: string[];
  pleatsOrGathers?: string;
  princessSeam: boolean;
  waistSuppression?: string;
}

export interface GarmentFabricRecommendations {
  primaryFabrics: string[];
  requiredStretch: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  estimatedLengthMeters150cm: number;
  estimatedLengthMeters110cm: number;
  liningRequired: boolean;
}

export interface GarmentBaseBlockRecommendation {
  baseBlock: "FITTED_BODICE" | "SKIRT" | "SLEEVE" | "TROUSER" | "DRESS_COMBO";
  recommendedMethod: "MULLER" | "METRIC" | "GRLAWEIN" | "UNIVERSAL";
  rationale: string;
}

export interface GarmentDraftingStep {
  stepNumber: number;
  title: string;
  description: string;
  modifications: string[];
}

export interface MatchingMarketplacePattern {
  id: string;
  title: string;
  slug: string;
  similarityScore: number;
}

export interface GarmentAnalysis {
  silhouette: GarmentSilhouette;
  neckline: GarmentNeckline;
  sleeves: GarmentSleeves;
  dartsAndPleats: GarmentDartsAndPleats;
  fabricRecommendations: GarmentFabricRecommendations;
  baseBlockRecommendation: GarmentBaseBlockRecommendation;
  draftingSteps: GarmentDraftingStep[];
  matchingMarketplacePatterns: MatchingMarketplacePattern[];
  confidenceScore: number;
}

export type GarmentPresetKey = "trench_coat" | "evening_gown" | "blouse" | "tailored_trousers";

/**
 * Validates a GarmentAnalysis object against the strict Dooz schema.
 */
export function validateGarmentAnalysis(result: any): { valid: boolean; error?: string } {
  if (!result || typeof result !== "object") {
    return { valid: false, error: "Result must be a non-null object" };
  }

  // Check silhouette
  if (!result.silhouette || !result.silhouette.type || !result.silhouette.persianName) {
    return { valid: false, error: "Missing or invalid silhouette object" };
  }

  // Check neckline
  if (!result.neckline || !result.neckline.type || typeof result.neckline.facingWidthCm !== "number") {
    return { valid: false, error: "Missing or invalid neckline object" };
  }

  // Check sleeves
  if (!result.sleeves || !result.sleeves.type || !result.sleeves.persianName) {
    return { valid: false, error: "Missing or invalid sleeves object" };
  }

  // Check dartsAndPleats
  if (
    !result.dartsAndPleats ||
    !Array.isArray(result.dartsAndPleats.frontDarts) ||
    typeof result.dartsAndPleats.princessSeam !== "boolean"
  ) {
    return { valid: false, error: "Missing or invalid dartsAndPleats object" };
  }

  // Check fabricRecommendations
  if (
    !result.fabricRecommendations ||
    !Array.isArray(result.fabricRecommendations.primaryFabrics) ||
    typeof result.fabricRecommendations.estimatedLengthMeters150cm !== "number"
  ) {
    return { valid: false, error: "Missing or invalid fabricRecommendations object" };
  }

  // Check baseBlockRecommendation
  const validBlocks = ["FITTED_BODICE", "SKIRT", "SLEEVE", "TROUSER", "DRESS_COMBO"];
  const validMethods = ["MULLER", "METRIC", "GRLAWEIN", "UNIVERSAL"];
  if (
    !result.baseBlockRecommendation ||
    !validBlocks.includes(result.baseBlockRecommendation.baseBlock) ||
    !validMethods.includes(result.baseBlockRecommendation.recommendedMethod)
  ) {
    return { valid: false, error: "Missing or invalid baseBlockRecommendation object" };
  }

  // Check draftingSteps
  if (!Array.isArray(result.draftingSteps) || result.draftingSteps.length === 0) {
    return { valid: false, error: "draftingSteps must be a non-empty array" };
  }

  // Check confidenceScore
  if (
    typeof result.confidenceScore !== "number" ||
    result.confidenceScore < 0 ||
    result.confidenceScore > 1
  ) {
    return { valid: false, error: "confidenceScore must be a number between 0 and 1" };
  }

  return { valid: true };
}

export const PRESET_ANALYSES: Record<string, GarmentAnalysis> = {
  trench_coat: {
    silhouette: {
      type: "A_LINE",
      persianName: "سیلوئت راسته با کمی فون (ترنچ کت)",
      description: "بارانی کلاسیک با کمربند و لبه‌های آزاد",
    },
    neckline: {
      type: "یقه انگلیسی سرخود با پهنای برگردان ۸ سانتی‌متر",
      collarType: "برگردان دو تکه با پایه ۲.۵ سانتی‌متر",
      facingWidthCm: 6.0,
      instructions: "سجاف سرخود جلو با پهنای ۶ سانتی‌متر و زاویه شکست در خط سینه",
    },
    sleeves: {
      type: "RAGLAN",
      persianName: "آستین رگلان دو تکه",
      capHeightAdjustment: "اتصال حلقه آستین به خط سرشانه و برش اریب",
      cuffType: "مچی بندینک‌دار با سگک تزئینی",
    },
    dartsAndPleats: {
      frontDarts: ["برش عمودی عصایی از کارور تا لبه دامن"],
      backDarts: ["برش عمودی پشت با چاک پیلی‌دار"],
      pleatsOrGathers: "چاک پیلی‌دار در وسط پشت",
      princessSeam: true,
      waistSuppression: "تنگ کردن درزهای پهلو به میزان ۱.۵ سانتی‌متر",
    },
    fabricRecommendations: {
      primaryFabrics: ["پارچه گاباردین ضدآب", "کتان کج‌راه", "مموری بارانی"],
      requiredStretch: "NONE",
      estimatedLengthMeters150cm: 2.8,
      estimatedLengthMeters110cm: 4.2,
      liningRequired: true,
    },
    baseBlockRecommendation: {
      baseBlock: "FITTED_BODICE",
      recommendedMethod: "MULLER",
      rationale:
        "متد مولر به دلیل تناسب دقیق در زاویه آستین رگلان و یقه انگلیسی استانداردترین خروجی را می‌دهد.",
    },
    draftingSteps: [
      {
        stepNumber: 1,
        title: "آماده‌سازی بالاتنه پایه مولر",
        description: "رسم کادر اولیه بالاتنه با آزادی ۸ سانتی‌متر برای پالتو و بارانی",
        modifications: [
          "افزودن آزادی دور سینه به میزان ۸ سانتی‌متر",
          "پایین آوردن کف حلقه به میزان ۲ سانتی‌متر",
        ],
      },
      {
        stepNumber: 2,
        title: "طراحی برش رگلان",
        description: "انتقال حلقه آستین به خط یقه و اتصال بخش بالایی آستین به سرشانه",
        modifications: ["تقسیم طوق یقه به نسبت ۱ به ۲", "رسم خط منحنی رگلان تا زیر بغل"],
      },
      {
        stepNumber: 3,
        title: "طراحی یقه انگلیسی و دکمه‌خور دوبل",
        description: "اضافه کردن حق جادکمه دوبل ۶ سانتی‌متر به خط وسط جلو",
        modifications: ["پیش‌روی ۶ سانتی‌متر در خط وسط جلو برای مدل چهار دکمه"],
      },
    ],
    matchingMarketplacePatterns: [
      {
        id: "pattern-trench-007",
        title: "بارانی ترنچ کژوال با آستین رگلان و کمربند",
        slug: "casual-raglan-trench-coat",
        similarityScore: 0.94,
      },
    ],
    confidenceScore: 0.92,
  },
  evening_gown: {
    silhouette: {
      type: "HOURGLASS",
      persianName: "سیلوئت ساعت شنی ماکسی (پیراهن شب)",
      description: "پیراهن مجلسی قالب تن با دامن کلوش ماهی",
    },
    neckline: {
      type: "یقه دلبری / قایقی",
      collarType: "بدون یقه با سجاف مخفی",
      facingWidthCm: 4.0,
      instructions: "باز کردن سرشانه به میزان ۳ سانتی‌متر و گودی یقه به میزان ۵ سانتی‌متر",
    },
    sleeves: {
      type: "SLEEVELESS",
      persianName: "حلقه آستین پاکتی / بدون آستین",
      capHeightAdjustment: "بدون آستین؛ تنگی حلقه آستین ۱.۵ سانتی‌متر",
    },
    dartsAndPleats: {
      frontDarts: ["برش پرنسسی / عصایی از سرشانه تا باسن"],
      backDarts: ["ساسون گودی کمر عمیق"],
      pleatsOrGathers: "فاقد پیلی؛ کلوش ملایم در دنباله دامن",
      princessSeam: true,
      waistSuppression: "تنگ کردن حداکثری کمر (آزادی صفر)",
    },
    fabricRecommendations: {
      primaryFabrics: ["کرپ باربی گرم بالا", "ساتن آمریکایی", "مخمل کش"],
      requiredStretch: "LOW",
      estimatedLengthMeters150cm: 2.2,
      estimatedLengthMeters110cm: 3.5,
      liningRequired: true,
    },
    baseBlockRecommendation: {
      baseBlock: "FITTED_BODICE",
      recommendedMethod: "GRLAWEIN",
      rationale:
        "متد گرلاوین به دلیل قد بالاتنه مستقل جلو و پشت، قالب تن بی‌نقصی برای لباس‌های مجلسی اندامی بدون ساسون اضافه می‌دهد.",
    },
    draftingSteps: [
      {
        stepNumber: 1,
        title: "رسم بالاتنه اولیه بدون آزادی",
        description: "استفاده از الگوی بالاتنه گرلاوین با آزادی صفر",
        modifications: ["آزادی دور سینه: ۱ سانتی‌متر", "آزادی کمر: ۰ سانتی‌متر"],
      },
      {
        stepNumber: 2,
        title: "انتقال ساسون‌ها به برش عصایی",
        description: "هدایت ساسون زیربغل و سرشانه به منحنی حلقه آستین",
        modifications: ["طراحی خط منحنی ملایم از کف حلقه به نوک سینه"],
      },
    ],
    matchingMarketplacePatterns: [
      {
        id: "pattern-princess-002",
        title: "پیراهن مجلسی برش پرنسسی با دامن فون",
        slug: "princess-seam-evening-dress",
        similarityScore: 0.96,
      },
    ],
    confidenceScore: 0.95,
  },
  blouse: {
    silhouette: {
      type: "LOOSE_FIT",
      persianName: "سیلوئت آزاد با گره کمر (شومیز کژوال)",
      description: "بلوز سبک اداری با یقه شومیز پایه‌دار و آستین پفی",
    },
    neckline: {
      type: "یقه شومیز مردانه با پایه جدا",
      collarType: "پایه‌دار ۲.۵ سانتی‌متر با برگردان ۴ سانتی‌متر",
      facingWidthCm: 3.0,
      instructions: "سجاف دکمه‌خور متصل جلو به پهنای ۳ سانتی‌متر",
    },
    sleeves: {
      type: "BISHOP",
      persianName: "آستین بیشاپ مچ‌دار با چین در لبه مچ",
      capHeightAdjustment: "تاج آستین نرمال بدون خرد اضافه",
      cuffType: "مچی پاکتی ۵ سانتی‌متر با دو دکمه",
    },
    dartsAndPleats: {
      frontDarts: ["ساسون زیر سینه باز شده به عنوان آزادی"],
      backDarts: ["پشت دولای بسته با پیلی دوقلو زیر یوک"],
      pleatsOrGathers: "چین سوزنی روی مچ آستین و پیلی زیر یوک پشت",
      princessSeam: false,
      waistSuppression: "بدون ساسون کمر؛ سیلوئت مستقیم",
    },
    fabricRecommendations: {
      primaryFabrics: ["کرپ حریر", "لینن نخ ترک", "تترون الیاف طبیعی"],
      requiredStretch: "NONE",
      estimatedLengthMeters150cm: 1.6,
      estimatedLengthMeters110cm: 2.4,
      liningRequired: false,
    },
    baseBlockRecommendation: {
      baseBlock: "FITTED_BODICE",
      recommendedMethod: "METRIC",
      rationale: "متد متریک ادریج با سرعت بالا و آزادی‌های مدرن، گزینه‌ای بهینه برای انواع شومیز و بلوزهای راحت است.",
    },
    draftingSteps: [
      {
        stepNumber: 1,
        title: "رسم بالاتنه آزاد متریک",
        description: "افزودن ۶ سانتی‌متر آزادی دور سینه و حذف ساسون سرشانه",
        modifications: ["آزادی دور سینه: ۶ سانتی‌متر", "پایین بردن گودی یقه: ۱ سانتی‌متر"],
      },
      {
        stepNumber: 2,
        title: "طراحی آستین پفی با مچ پهن",
        description: "اوزمان‌دهی به الگوی پایه آستین در لبه مچ به میزان ۱۵ سانتی‌متر",
        modifications: ["برش طولی آستین به ۴ قسمت و ایجاد گشادی ۳ سانتی‌متری در هر شیار"],
      },
    ],
    matchingMarketplacePatterns: [
      {
        id: "pattern-blouse-003",
        title: "شومیز یقه مردانه با آستین مچ‌دار",
        slug: "classic-shirt-blouse",
        similarityScore: 0.91,
      },
    ],
    confidenceScore: 0.89,
  },
  tailored_trousers: {
    silhouette: {
      type: "STRAIGHT_LEG",
      persianName: "شلوار راسته کلاسیک اتوخورده",
      description: "شلوار پارچه‌ای راسته با خط اتوی مرکزی و کمری سجاف‌دار",
    },
    neckline: {
      type: "فاق بلند با کمری پهن",
      facingWidthCm: 4.0,
      instructions: "کمری ۴ سانتی‌متر با پل کمربند و قزن شلواری مخفی",
    },
    sleeves: {
      type: "PANT_LEG",
      persianName: "دم‌پای راسته ۲۲ سانتی‌متر",
      capHeightAdjustment: "قد فاق استاندارد با آزادی ۳ سانتی‌متر در زانو",
    },
    dartsAndPleats: {
      frontDarts: ["یک عدد پیلی تک رو به درز پهلو"],
      backDarts: ["دو عدد ساسون گودی باسن پشت"],
      pleatsOrGathers: "پیلی جلو منطبق بر خط اتو",
      princessSeam: false,
      waistSuppression: "انتقال مازاد کمر به ساسون‌های پشت و درز پهلو",
    },
    fabricRecommendations: {
      primaryFabrics: ["فاستونی پشم و پلی‌استر", "کرپ مازراتی گرم‌بالا", "گاباردین شلواری"],
      requiredStretch: "LOW",
      estimatedLengthMeters150cm: 1.35,
      estimatedLengthMeters110cm: 2.3,
      liningRequired: false,
    },
    baseBlockRecommendation: {
      baseBlock: "TROUSER",
      recommendedMethod: "MULLER",
      rationale: "متد مولر با احتساب دقیق برجستگی باسن و زاویه فاق، ایستایی کم‌نظیری در خط اتو ایجاد می‌کند.",
    },
    draftingSteps: [
      {
        stepNumber: 1,
        title: "رسم خطوط افقی فاق، باسن و زانو",
        description: "محاسبه قد فاق با فرمول یک چهارم دور باسن منهای ۱.۵ سانتی‌متر",
        modifications: ["قد فاق: ۲۶.۵ سانتی‌متر", "عرض دم‌پا: ۲۲ سانتی‌متر"],
      },
      {
        stepNumber: 2,
        title: "انحنای فاق جلو و شیب پشت",
        description: "شیب فاق پشت به میزان ۳.۵ سانتی‌متر به سمت داخل برای پر کردن گودی کمر",
        modifications: ["امتداد فاق پشت: ۷.۵ سانتی‌متر"],
      },
    ],
    matchingMarketplacePatterns: [
      {
        id: "pattern-trouser-005",
        title: "شلوار راسته فاستونی با خط اتو",
        slug: "tailored-straight-trousers",
        similarityScore: 0.93,
      },
    ],
    confidenceScore: 0.91,
  },
};

/**
 * Generates a rich, deterministic heuristic analysis result when Gemini Vision is unavailable.
 */
export function generateHeuristicFallback(presetKey = "trench_coat"): GarmentAnalysis {
  const normalizedKey = String(presetKey).toLowerCase().trim();
  const match = PRESET_ANALYSES[normalizedKey] || PRESET_ANALYSES.trench_coat;
  return JSON.parse(JSON.stringify(match));
}

/**
 * Generates a direct studio deep-link URL encoding the extracted base block and method.
 */
export function generateStudioDeepLink(analysis: GarmentAnalysis): string {
  const params = new URLSearchParams();
  const validBlocks = ["SKIRT", "FITTED_BODICE", "SLEEVE", "TROUSER"];
  const block = validBlocks.includes(analysis.baseBlockRecommendation?.baseBlock)
    ? analysis.baseBlockRecommendation.baseBlock
    : "FITTED_BODICE";

  params.set("baseBlock", block);
  params.set(
    "method",
    analysis.baseBlockRecommendation?.recommendedMethod || "MULLER"
  );
  params.set("preset", "ai-extracted");
  return `/studio?${params.toString()}`;
}

/**
 * Validates uploaded file size and MIME type.
 */
export function validateUploadPayload(file: { size?: number; mimeType?: string; type?: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file) return { valid: false, error: "هیچ فایلی ارسال نشده است" };

  const size = file.size ?? 0;
  if (size > 10 * 1024 * 1024) {
    return { valid: false, error: "حجم فایل نباید بیشتر از ۱۰ مگابایت باشد" };
  }

  const mime = file.mimeType || file.type || "";
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(mime)) {
    return { valid: false, error: "تنها تصاویر JPG، PNG و WebP مجاز هستند" };
  }

  return { valid: true };
}

/**
 * Analyzes garment image using Google Gemini 1.5 Flash Vision API with automatic zero-crash heuristic fallback.
 */
export async function analyzeGarmentImage(
  apiKey: string | undefined,
  imagePayload: {
    base64?: string;
    mimeType?: string;
    preset?: string;
  }
): Promise<{ source: "GEMINI_VISION" | "HEURISTIC_FALLBACK"; result: GarmentAnalysis }> {
  // If no API key provided or empty string, immediately trigger fallback
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      source: "HEURISTIC_FALLBACK",
      result: generateHeuristicFallback(imagePayload.preset || "trench_coat"),
    };
  }

  // If base64 is missing, check if preset requested
  if (!imagePayload.base64 || imagePayload.base64.trim().length === 0) {
    return {
      source: "HEURISTIC_FALLBACK",
      result: generateHeuristicFallback(imagePayload.preset || "trench_coat"),
    };
  }

  try {
    const cleanBase64 = imagePayload.base64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    const mimeType = imagePayload.mimeType || "image/jpeg";

    const prompt = `You are a master pattern cutter and tailor specializing in Müller, Metric, and Grlawein drafting systems.
Analyze the garment in the image and reverse-engineer its pattern construction.
You MUST output valid, raw JSON conforming strictly to the following TypeScript interface without Markdown backticks:
{
  "silhouette": { "type": string, "persianName": string, "description": string },
  "neckline": { "type": string, "collarType": string, "facingWidthCm": number, "instructions": string },
  "sleeves": { "type": string, "persianName": string, "capHeightAdjustment": string, "cuffType": string },
  "dartsAndPleats": { "frontDarts": string[], "backDarts": string[], "pleatsOrGathers": string, "princessSeam": boolean, "waistSuppression": string },
  "fabricRecommendations": { "primaryFabrics": string[], "requiredStretch": "NONE"|"LOW"|"MEDIUM"|"HIGH", "estimatedLengthMeters150cm": number, "estimatedLengthMeters110cm": number, "liningRequired": boolean },
  "baseBlockRecommendation": { "baseBlock": "FITTED_BODICE"|"SKIRT"|"SLEEVE"|"TROUSER"|"DRESS_COMBO", "recommendedMethod": "MULLER"|"METRIC"|"GRLAWEIN"|"UNIVERSAL", "rationale": string },
  "draftingSteps": [ { "stepNumber": number, "title": string, "description": string, "modifications": string[] } ],
  "matchingMarketplacePatterns": [ { "id": string, "title": string, "slug": string, "similarityScore": number } ],
  "confidenceScore": number
}
Ensure all descriptions, titles, and tailoring terminology are in authentic Persian (فارسی تخصصی خیاطی).`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: "application/json",
      },
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Dooz AI] Gemini Vision API returned status ${res.status}. Falling back to heuristic engine.`);
      return {
        source: "HEURISTIC_FALLBACK",
        result: generateHeuristicFallback(imagePayload.preset || "trench_coat"),
      };
    }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response parts from Gemini Vision");
    }

    const parsed = JSON.parse(rawText);
    const validation = validateGarmentAnalysis(parsed);
    if (!validation.valid) {
      console.warn(`[Dooz AI] Gemini Vision output failed schema validation (${validation.error}). Falling back.`);
      return {
        source: "HEURISTIC_FALLBACK",
        result: generateHeuristicFallback(imagePayload.preset || "trench_coat"),
      };
    }

    return {
      source: "GEMINI_VISION",
      result: parsed,
    };
  } catch (err: any) {
    console.warn(`[Dooz AI] Gemini call failed (${err.message}). Activating zero-crash heuristic fallback.`);
    return {
      source: "HEURISTIC_FALLBACK",
      result: generateHeuristicFallback(imagePayload.preset || "trench_coat"),
    };
  }
}
