/**
 * Dooz Test Harness - AI Outfit Analyzer Schema & Heuristic Fallback Engine
 */

export function validateGarmentAnalysis(result) {
  if (!result || typeof result !== 'object') {
    return { valid: false, error: 'Result must be a non-null object' };
  }

  // Check silhouette
  if (!result.silhouette || !result.silhouette.type || !result.silhouette.persianName) {
    return { valid: false, error: 'Missing or invalid silhouette object' };
  }

  // Check neckline
  if (!result.neckline || !result.neckline.type || typeof result.neckline.facingWidthCm !== 'number') {
    return { valid: false, error: 'Missing or invalid neckline object' };
  }

  // Check sleeves
  if (!result.sleeves || !result.sleeves.type || !result.sleeves.persianName) {
    return { valid: false, error: 'Missing or invalid sleeves object' };
  }

  // Check dartsAndPleats
  if (!result.dartsAndPleats || !Array.isArray(result.dartsAndPleats.frontDarts) || typeof result.dartsAndPleats.princessSeam !== 'boolean') {
    return { valid: false, error: 'Missing or invalid dartsAndPleats object' };
  }

  // Check fabricRecommendations
  if (!result.fabricRecommendations || !Array.isArray(result.fabricRecommendations.primaryFabrics) || typeof result.fabricRecommendations.estimatedLengthMeters150cm !== 'number') {
    return { valid: false, error: 'Missing or invalid fabricRecommendations object' };
  }

  // Check baseBlockRecommendation
  const validBlocks = ['FITTED_BODICE', 'SKIRT', 'SLEEVE', 'TROUSER', 'DRESS_COMBO'];
  const validMethods = ['MULLER', 'METRIC', 'GRLAWEIN', 'UNIVERSAL'];
  if (!result.baseBlockRecommendation || !validBlocks.includes(result.baseBlockRecommendation.baseBlock) || !validMethods.includes(result.baseBlockRecommendation.recommendedMethod)) {
    return { valid: false, error: 'Missing or invalid baseBlockRecommendation object' };
  }

  // Check draftingSteps
  if (!Array.isArray(result.draftingSteps) || result.draftingSteps.length === 0) {
    return { valid: false, error: 'draftingSteps must be a non-empty array' };
  }

  // Check confidenceScore
  if (typeof result.confidenceScore !== 'number' || result.confidenceScore < 0 || result.confidenceScore > 1) {
    return { valid: false, error: 'confidenceScore must be a number between 0 and 1' };
  }

  return { valid: true };
}

export function generateHeuristicFallback(presetKey = 'trench_coat') {
  const PRESETS = {
    trench_coat: {
      silhouette: {
        type: 'A_LINE',
        persianName: 'سیلوئت راسته با کمی فون (ترنچ کت)',
        description: 'بارانی کلاسیک با کمربند و لبه‌های آزاد',
      },
      neckline: {
        type: 'یقه انگلیسی سرخود با پهنای برگردان ۸ سانتی‌متر',
        collarType: 'برگردان دو تکه با پایه ۲.۵ سانتی‌متر',
        facingWidthCm: 6.0,
        instructions: 'سجاف سرخود جلو با پهنای ۶ سانتی‌متر و زاویه شکست در خط سینه',
      },
      sleeves: {
        type: 'RAGLAN',
        persianName: 'آستین رگلان دو تکه',
        capHeightAdjustment: 'اتصال حلقه آستین به خط سرشانه و برش اریب',
        cuffType: 'مچی بندینک‌دار با سگک تزئینی',
      },
      dartsAndPleats: {
        frontDarts: ['برش عمودی عصایی از کارور تا لبه دامن'],
        backDarts: ['برش عمودی پشت با چاک پیلی‌دار'],
        pleatsOrGathers: 'چاک پیلی‌دار در وسط پشت',
        princessSeam: true,
        waistSuppression: 'تنگ کردن درزهای پهلو به میزان ۱.۵ سانتی‌متر',
      },
      fabricRecommendations: {
        primaryFabrics: ['پارچه گاباردین ضدآب', 'کتان کج‌راه', 'مموری بارانی'],
        requiredStretch: 'NONE',
        estimatedLengthMeters150cm: 2.80,
        estimatedLengthMeters110cm: 4.20,
        liningRequired: true,
      },
      baseBlockRecommendation: {
        baseBlock: 'FITTED_BODICE',
        recommendedMethod: 'MULLER',
        rationale: 'متد مولر به دلیل تناسب دقیق در زاویه آستین رگلان و یقه انگلیسی استانداردترین خروجی را می‌دهد.',
      },
      draftingSteps: [
        {
          stepNumber: 1,
          title: 'آماده‌سازی بالاتنه پایه مولر',
          description: 'رسم کادر اولیه بالاتنه با آزادی ۸ سانتی‌متر برای پالتو و بارانی',
          modifications: ['افزودن آزادی دور سینه به میزان ۸ سانتی‌متر', 'پایین آوردن کف حلقه به میزان ۲ سانتی‌متر'],
        },
        {
          stepNumber: 2,
          title: 'طراحی برش رگلان',
          description: 'انتقال حلقه آستین به خط یقه و اتصال بخش بالایی آستین به سرشانه',
          modifications: ['تقسیم طوق یقه به نسبت ۱ به ۲', 'رسم خط منحنی رگلان تا زیر بغل'],
        },
        {
          stepNumber: 3,
          title: 'طراحی یقه انگلیسی و دکمه‌خور دوبل',
          description: 'اضافه کردن حق جادکمه دوبل ۶ سانتی‌متر به خط وسط جلو',
          modifications: ['پیش‌روی ۶ سانتی‌متر در خط وسط جلو برای مدل چهار دکمه'],
        },
      ],
      matchingMarketplacePatterns: [
        {
          id: 'pattern-trench-007',
          title: 'بارانی ترنچ کژوال با آستین رگلان و کمربند',
          slug: 'casual-raglan-trench-coat',
          similarityScore: 0.94,
        },
      ],
      confidenceScore: 0.92,
    },
    evening_gown: {
      silhouette: {
        type: 'HOURGLASS',
        persianName: 'سیلوئت ساعت شنی ماکسی (پیراهن شب)',
        description: 'پیراهن مجلسی قالب تن با دامن کلوش ماهی',
      },
      neckline: {
        type: 'یقه دلبری / قایقی',
        collarType: 'بدون یقه با سجاف مخفی',
        facingWidthCm: 4.0,
        instructions: 'باز کردن سرشانه به میزان ۳ سانتی‌متر و گودی یقه به میزان ۵ سانتی‌متر',
      },
      sleeves: {
        type: 'SLEEVELESS',
        persianName: 'حلقه آستین پاکتی / بدون آستین',
        capHeightAdjustment: 'بدون آستین؛ تنگی حلقه آستین ۱.۵ سانتی‌متر',
      },
      dartsAndPleats: {
        frontDarts: ['برش پرنسسی / عصایی از سرشانه تا باسن'],
        backDarts: ['ساسون گودی کمر عمیق'],
        princessSeam: true,
        waistSuppression: 'تنگ کردن حداکثری کمر (آزادی صفر)',
      },
      fabricRecommendations: {
        primaryFabrics: ['کرپ باربی گرم بالا', 'ساتن آمریکایی', 'مخمل کش'],
        requiredStretch: 'LOW',
        estimatedLengthMeters150cm: 2.20,
        estimatedLengthMeters110cm: 3.50,
        liningRequired: true,
      },
      baseBlockRecommendation: {
        baseBlock: 'FITTED_BODICE',
        recommendedMethod: 'GRLAWEIN',
        rationale: 'متد گرلاوین به دلیل قد بالاتنه مستقل جلو و پشت، قالب تن بی‌نقصی برای لباس‌های مجلسی اندامی بدون ساسون اضافه می‌دهد.',
      },
      draftingSteps: [
        {
          stepNumber: 1,
          title: 'رسم بالاتنه اولیه بدون آزادی',
          description: 'استفاده از الگوی بالاتنه گرلاوین با آزادی صفر',
          modifications: ['آزادی دور سینه: ۱ سانتی‌متر', 'آزادی کمر: ۰ سانتی‌متر'],
        },
        {
          stepNumber: 2,
          title: 'انتقال ساسون‌ها به برش عصایی',
          description: 'هدایت ساسون زیربغل و سرشانه به منحنی حلقه آستین',
          modifications: ['طراحی خط منحنی ملایم از کف حلقه به نوک سینه'],
        },
      ],
      matchingMarketplacePatterns: [
        {
          id: 'pattern-princess-002',
          title: 'پیراهن مجلسی برش پرنسسی با دامن فون',
          slug: 'princess-seam-evening-dress',
          similarityScore: 0.96,
        },
      ],
      confidenceScore: 0.95,
    },
  };

  return PRESETS[presetKey] || PRESETS.trench_coat;
}
