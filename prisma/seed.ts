import {
  PrismaClient,
  Role,
  DraftingMethod,
  BlockType,
  FitType,
  Difficulty,
  TransactionType,
  PayoutStatus,
  PurchaseStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("🌱 Starting Dooz database seeding...");

  // 1. Clean existing records in reverse dependency order (idempotency)
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.savedDraft.deleteMany();
  await prisma.patternStep.deleteMany();
  await prisma.patternProduct.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing database tables.");

  // =========================================================================
  // 2. Demo User Accounts
  // =========================================================================
  const tailorPasswordHash = await hashPassword("Tailor123!");
  const creatorPasswordHash = await hashPassword("Creator123!");
  const adminPasswordHash = await hashPassword("Admin123!");

  const tailorUser = await prisma.user.create({
    data: {
      name: "استاد علی محمدی",
      email: "tailor@dooz.ir",
      phone: "09121111111",
      passwordHash: tailorPasswordHash,
      role: Role.USER,
      bio: "خیاط و طراح لباس زنانه با ۲۰ سال سابقه در شخصی‌دوزی و الگوکشی متدهای مولر و متریک.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      walletBalance: 0,
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      name: "مهسا رادمنش",
      email: "creator@dooz.ir",
      phone: "09122222222",
      passwordHash: creatorPasswordHash,
      role: Role.CREATOR,
      bio: "مدرس طراحی لباس و مدلسازی الگو، فارغ‌التحصیل طراحی پارچه و لباس و متخصص متد مولر آلمان.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      shebaNumber: "IR060560000000012345678901", // Bank Saman
      walletBalance: 2400000, // 2,400,000 Toman
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "مدیریت سامانه دوز",
      email: "admin@dooz.ir",
      phone: "09123333333",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      bio: "مدیریت سیستم و پشتیبانی پلتفرم تخصصی دوز.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      walletBalance: 0,
    },
  });

  console.log("✅ Created 3 Demo Users: Tailor, Creator, Admin");

  // =========================================================================
  // 3. Tailor Client Profiles (Realistic Anthropometrics & Posture Tags)
  // =========================================================================
  const clientSara = await prisma.clientProfile.create({
    data: {
      tailorId: tailorUser.id,
      firstName: "سارا",
      lastName: "محمدی",
      phone: "09351234567",
      gender: "FEMALE",
      fitPreference: FitType.CLASSIC,
      postureTags: [], // Standard balanced posture
      notes: "مشتری قدیمی مزون - ترجیح پارچه‌های کرپ و لنین طبیعی. الگوی بالاتنه متریک بسیار مناسب نشست.",
      measurements: {
        totalHeight: 168,
        bustCircumference: 92,
        waistCircumference: 70,
        hipCircumference: 98,
        highHipCircumference: 88,
        acrossBack: 35,
        acrossFront: 33,
        shoulderLength: 12.5,
        neckCircumference: 36,
        bustDistance: 19,
        backWaistLength: 41,
        frontWaistLength: 44,
        bustHeight: 26,
        armholeDepth: 20.5,
        hipHeight: 20,
        sleeveLength: 59,
        bicepCircumference: 28,
        wristCircumference: 16,
        elbowCircumference: 25,
        skirtLength: 65,
        trouserOutseam: 102,
        trouserInseam: 76,
        crotchDepth: 26,
        thighCircumference: 56,
        kneeCircumference: 38,
        ankleCircumference: 24,
      },
    },
  });

  const clientMaryam = await prisma.clientProfile.create({
    data: {
      tailorId: tailorUser.id,
      firstName: "مریم",
      lastName: "احمدی",
      phone: "09129876543",
      gender: "FEMALE",
      fitPreference: FitType.LOOSE,
      postureTags: ["PROMINENT_ABDOMEN", "SWAYBACK"],
      notes: "دارای گودی کمر محسوس و برجستگی زیر شکم. در الگوکشی خط کمر جلو ۱.۵ سانتی‌متر بالا برده شود و ساسون زیپ پشت تشدید گردد.",
      measurements: {
        totalHeight: 162,
        bustCircumference: 104,
        waistCircumference: 88,
        hipCircumference: 110,
        highHipCircumference: 98,
        acrossBack: 38,
        acrossFront: 37,
        shoulderLength: 13,
        neckCircumference: 39,
        bustDistance: 21,
        backWaistLength: 39,
        frontWaistLength: 46,
        bustHeight: 28.5,
        armholeDepth: 22,
        hipHeight: 21,
        sleeveLength: 57,
        bicepCircumference: 33,
        wristCircumference: 17.5,
        elbowCircumference: 28,
        skirtLength: 70,
        trouserOutseam: 98,
        trouserInseam: 72,
        crotchDepth: 27.5,
        thighCircumference: 63,
        kneeCircumference: 42,
        ankleCircumference: 26,
      },
    },
  });

  const clientZahra = await prisma.clientProfile.create({
    data: {
      tailorId: tailorUser.id,
      firstName: "زهرا",
      lastName: "کریمی",
      phone: "09195554321",
      gender: "FEMALE",
      fitPreference: FitType.TIGHT,
      postureTags: ["SLOPING_SHOULDERS", "PROMINENT_HIP"],
      notes: "افتادگی شانه حدود ۱.۵ سانتی‌متر نیاز به اصلاح شیب سرشانه دارد. انحنای باسن بیشتر از حد نرمال است.",
      measurements: {
        totalHeight: 172,
        bustCircumference: 88,
        waistCircumference: 66,
        hipCircumference: 99,
        highHipCircumference: 86,
        acrossBack: 34,
        acrossFront: 32,
        shoulderLength: 12,
        neckCircumference: 35,
        bustDistance: 18,
        backWaistLength: 42,
        frontWaistLength: 43,
        bustHeight: 25,
        armholeDepth: 19.5,
        hipHeight: 21.5,
        sleeveLength: 61,
        bicepCircumference: 26.5,
        wristCircumference: 15.5,
        elbowCircumference: 24,
        skirtLength: 60,
        trouserOutseam: 106,
        trouserInseam: 80,
        crotchDepth: 25.5,
        thighCircumference: 54,
        kneeCircumference: 36,
        ankleCircumference: 23,
      },
    },
  });

  console.log("✅ Created 3 Client Profiles with Anatomical Defect Tags");

  // =========================================================================
  // 4. Sample Technical Flat Vectors (SVG strings)
  // =========================================================================
  const sampleFlatSvgFront = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <rect width="100%" height="100%" fill="#F8FAFC"/>
    <path d="M140,80 L200,120 L260,80 L310,130 L270,160 L280,340 L120,340 L130,160 L90,130 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
    <path d="M200,120 L200,340" stroke="#0F172A" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="200" cy="180" r="3" fill="#0F172A"/>
    <circle cx="200" cy="220" r="3" fill="#0F172A"/>
    <circle cx="200" cy="260" r="3" fill="#0F172A"/>
  </svg>`;

  const sampleFlatSvgBack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <rect width="100%" height="100%" fill="#F8FAFC"/>
    <path d="M140,80 Q200,90 260,80 L310,130 L270,160 L280,340 L120,340 L130,160 L90,130 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
    <path d="M200,85 L200,340" stroke="#0F172A" stroke-width="2"/>
    <path d="M160,200 L160,260 M240,200 L240,260" stroke="#64748B" stroke-width="1.5"/>
  </svg>`;

  // =========================================================================
  // 5. 8 Realistic Persian Marketplace Patterns
  // =========================================================================
  const patternsData = [
    {
      title: "مانتو کتی کلاسیک با یقه انگلیسی",
      slug: "classic-tailored-blazer-coat",
      description: "مانتو کتی رسمی و مزونی با الگوسازی دقیق به روش مولر آلمان. دارای یقه انگلیسی ایستاده، برش عصایی در پیش و پشت، جیب فیلتابی لبه‌دار و آستین دو تکه کتی فرم‌دار.",
      category: "OUTERWEAR",
      baseBlock: BlockType.BODICE,
      draftingMethod: DraftingMethod.MULLER,
      fitType: FitType.CLASSIC,
      difficulty: Difficulty.ADVANCED,
      price: 350000,
      coverImage: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
      galleryImages: [
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800",
      ],
      fabricRequirements: {
        recommendedFabrics: ["کرپ باربی", "فاستونی پشمی لطیف", "کتان ترک"],
        bolt150cmLengthMeters: 2.2,
        bolt110cmLengthMeters: 3.4,
        liningLengthMeters: 1.6,
        interfacingMeters: 1.2,
        notes: "نیاز به لایی‌کشی کامل سجاف جلو، یقه و لبه آستین برای فرم‌دهی کتی.",
      },
      parametricConfig: {
        baseBlock: "BODICE",
        method: "MULLER",
        easeOffsets: { bust: 6.0, waist: 5.0, hip: 6.0 },
        necklineModifications: { depthDrop: 14.0, shoulderDrop: 2.0, lapelWidth: 8.5 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "آماده‌سازی بالاتنه پایه و آزادی‌ها",
          description: "رسم الگوی بالاتنه پایه مولر با آزادی ۶ سانتی‌متر در دور سینه و انتقال ساسون سرشانه به خط حلقه آستین.",
          technicalDetails: { bustEaseCm: 6, shoulderDropCm: 2 },
        },
        {
          stepOrder: 2,
          title: "طراحی خط شکست و برگشت یقه انگلیسی",
          description: "تعیین دکمه‌خور ۲ سانتی‌متری جلو، زاویه شکست یقه تا خط سینه و رسم پایه و برگرد یقه انگلیسی.",
          technicalDetails: { overlapCm: 2, lapelWidthCm: 8.5 },
        },
        {
          stepOrder: 3,
          title: "مدلسازی آستین دوتکه کتی",
          description: "استخراج الگوی آستین دوتکه از بالاتنه کتی و اعمال ۳ سانتی‌متر خرد در تاج آستین.",
          technicalDetails: { crownEaseCm: 3.2 },
        },
        {
          stepOrder: 4,
          title: "طراحی سجاف، جیب فیلتابی و حق درزها",
          description: "طراحی سجاف ۶ سانتی‌متری جلو، علامت‌گذاری کیسه جیب فیلتاب و اضافه کردن حق درزهای استاندارد کتی.",
          technicalDetails: { facingWidthCm: 6, seamAllowanceCm: 1.5 },
        },
      ],
      reviews: [
        {
          rating: 5,
          fitFeedback: "TRUE_TO_SIZE",
          title: "نشست بی‌نظیر یقه و تنخور عالی",
          comment: "الگوی بسیار دقیقی است. یقه انگلیسی بدون کوچک‌ترین لقی یا کشیدگی خوابید و آستین کتی فوق‌العاده ایستاد.",
        },
      ],
    },
    {
      title: "پیراهن مجلسی برش پرنسسی با دامن فون",
      slug: "princess-seam-evening-dress",
      description: "پیراهن مجلسی شیک با برش عصایی (پرنسسی) از حلقه آستین تا خط باسن و امتداد فون ملایم در دامن. مدلسازی شده بر اساس متد متریک برای تنخور جذب و ساعت شنی.",
      category: "DRESSES",
      baseBlock: BlockType.BODICE,
      draftingMethod: DraftingMethod.METRIC,
      fitType: FitType.TIGHT,
      difficulty: Difficulty.ADVANCED,
      price: 420000,
      coverImage: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["ساتن آمریکایی", "کرپ کنزو", "میکادو"],
        bolt150cmLengthMeters: 2.8,
        bolt110cmLengthMeters: 4.2,
        liningLengthMeters: 2.2,
        interfacingMeters: 0.8,
        notes: "پیشنهاد می‌شود در درزهای برش عصایی از فنر حصیری ۵ میلی‌متری استفاده شود.",
      },
      parametricConfig: {
        baseBlock: "BODICE",
        method: "METRIC",
        easeOffsets: { bust: 1.5, waist: 1.0, hip: 2.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "رسم بالاتنه جذب متریک",
          description: "رسم پایه بالاتنه با آزادی حداقل (۱.۵ سانتی‌متر) برای فرم مجلسی چسبان.",
          technicalDetails: { bustEaseCm: 1.5 },
        },
        {
          stepOrder: 2,
          title: "انتقال ساسون‌ها به برش عصایی",
          description: "انتقال ساسون سرشانه و زیر سینه به منحنی حلقه آستین و انحنا دادن به برش پرنسسی.",
          technicalDetails: { curveRadiusCm: 18 },
        },
        {
          stepOrder: 3,
          title: "طراحی فون دامن و اوزمان‌ها",
          description: "گشادسازی درزهای پهلو و برش‌های پرنسسی به میزان ۴ سانتی‌متر در لبه پایین دامن.",
          technicalDetails: { flarePerPanelCm: 4 },
        },
      ],
      reviews: [
        {
          rating: 5,
          fitFeedback: "TRUE_TO_SIZE",
          title: "تنخور مجلسی دقیق بدون نیاز به پرو زیاد",
          comment: "انحنای روی سینه بسیار حساب‌شده است و نیاز به دستکاری در پرو نداشت.",
        },
      ],
    },
    {
      title: "شومیز آستین پفی و یقه شکاری",
      slug: "bishop-sleeve-blouse",
      description: "شومیز زنانه شیک با آستین اسقفی (پفی در لبه مچ)، مچ پهن ۶ سانتی‌متری دکمه‌خور، یقه شکاری پایه جدا و پیلی معکوس در پشت.",
      category: "TOPS_BLOUSES",
      baseBlock: BlockType.SLEEVE,
      draftingMethod: DraftingMethod.METRIC,
      fitType: FitType.LOOSE,
      difficulty: Difficulty.INTERMEDIATE,
      price: 180000,
      coverImage: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1551803091-e20673f15770?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["حریر کرپ", "ابریشم توییل", "وال نخی", "پوپلین"],
        bolt150cmLengthMeters: 1.6,
        bolt110cmLengthMeters: 2.5,
        interfacingMeters: 0.4,
        notes: "برای مچی و پایه یقه از لایی فرانسه یا لایی حریر نرم استفاده فرمایید.",
      },
      parametricConfig: {
        baseBlock: "SLEEVE",
        method: "METRIC",
        easeOffsets: { bicep: 8.0, wrist: 14.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "اوزمان‌دهی آستین پایه برای پف لبه",
          description: "برش‌های عمودی در الگوی آستین ساده و باز کردن اوزمان‌های ۳ سانتی‌متری در مچ.",
          technicalDetails: { slashSpreadCm: 12 },
        },
        {
          stepOrder: 2,
          title: "طراحی یقه شکاری دو تکه",
          description: "رسم پایه یقه ۲.۵ سانتی‌متری و برگرد یقه شکاری با نوک تیز ۴.۵ سانتی‌متر.",
          technicalDetails: { standHeightCm: 2.5, collarPointCm: 4.5 },
        },
      ],
      reviews: [
        {
          rating: 4,
          fitFeedback: "RUNS_LARGE",
          title: "مدل بسیار زیبا و ترند",
          comment: "آستین پف بسیار خوش‌فرمی دارد، فقط به دلیل آزادی مدل اگر اندام لاغری دارید یک سایز کوچک‌تر انتخاب کنید.",
        },
      ],
    },
    {
      title: "شلوار راسته زنانه با خط اتو و جیب فیلتابی",
      slug: "classic-straight-leg-trousers",
      description: "شلوار کلاسیک زنانه راسته با فاق استاندارد به متد مولر، خط اتوی دائمی، جیب مورب آمریکایی در پهلو و ساسون‌های متناسب پشت.",
      category: "TROUSERS",
      baseBlock: BlockType.TROUSER,
      draftingMethod: DraftingMethod.MULLER,
      fitType: FitType.CLASSIC,
      difficulty: Difficulty.INTERMEDIATE,
      price: 220000,
      coverImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["فاستونی کش", "کرپ مازراتی", "گاباردین"],
        bolt150cmLengthMeters: 1.3,
        bolt110cmLengthMeters: 2.2,
        interfacingMeters: 0.3,
        notes: "جیب‌ها و کمری شلوار لایی‌کشی شوند.",
      },
      parametricConfig: {
        baseBlock: "TROUSER",
        method: "MULLER",
        easeOffsets: { waist: 2.0, hip: 3.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "تعیین خط فاق و انحنای خشتک جلو",
          description: "محاسبه بلندی فاق و رسم انحنای پیش شلوار بر اساس یک‌بیستم دور باسن.",
          technicalDetails: { crotchExtensionCm: 4.2 },
        },
        {
          stepOrder: 2,
          title: "رسم شیب پشت و فاق پشت",
          description: "انتقال ۲.۵ سانتی‌متر خط کمر پشت به داخل و رسم فاق پشت برای راحتی نشستن.",
          technicalDetails: { backRiseSlantCm: 2.5 },
        },
        {
          stepOrder: 3,
          title: "تنظیم عرض زانو و دمپا",
          description: "ایجاد تعادل عرضی خط اتو با کسر مساوی از طرفین خط راستا در زانو و دمپا.",
          technicalDetails: { kneeWidthCm: 23, hemWidthCm: 21 },
        },
      ],
      reviews: [
        {
          rating: 5,
          fitFeedback: "TRUE_TO_SIZE",
          title: "فاق بی‌نقص مولر",
          comment: "فاق شلوار بدون کوچک‌ترین چین یا کیس ایستاد. یکی از بهترین الگوهای شلواری که استفاده کردم.",
        },
      ],
    },
    {
      title: "دامن فون کلاسیک چهار تکه",
      slug: "a-line-four-panel-skirt",
      description: "دامن فون ۴ تکه (دو درز پهلو + درز وسط پیش و پشت) مناسب افراد مبتدی. طراحی شده به متد گرلاوین با رسم ساده و تنخور راحت.",
      category: "SKIRTS",
      baseBlock: BlockType.SKIRT,
      draftingMethod: DraftingMethod.GRLAWEIN,
      fitType: FitType.CLASSIC,
      difficulty: Difficulty.BEGINNER,
      price: 0, // Free pattern
      coverImage: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["پوپلین", "کتان نخ", "جین کاغذی", "کرپ اسکاچی"],
        bolt150cmLengthMeters: 0.9,
        bolt110cmLengthMeters: 1.5,
        interfacingMeters: 0.2,
        notes: "پارچه کمتری مصرف می‌کند و دوخت آن کمتر از ۲ ساعت زمان می‌برد.",
      },
      parametricConfig: {
        baseBlock: "SKIRT",
        method: "GRLAWEIN",
        easeOffsets: { waist: 1.5, hip: 3.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "رسم دامن پایه و تقسیم ساسون‌ها",
          description: "رسم کادر دامن راسته گرلاوین و تقسیم ساسون‌های کمر به پهلو و برش وسط.",
          technicalDetails: { waistDartIntakeCm: 2.5 },
        },
        {
          stepOrder: 2,
          title: "اوزمان خط لبه پایین دامن",
          description: "گسترش درزهای پهلو و برش به میزان ۵ سانتی‌متر برای ایجاد حالت فون ملایم.",
          technicalDetails: { hemFlareCm: 5.0 },
        },
      ],
      reviews: [
        {
          rating: 5,
          fitFeedback: "TRUE_TO_SIZE",
          title: "بهترین الگوی رایگان برای شروع خیاطی",
          comment: "توضیحات گام‌به‌گام و تصویر خطوط راهنما برای هنرجویان من فوق‌العاده کاربردی بود.",
        },
      ],
    },
    {
      title: "پیراهن ماکسی چین‌دار تابستانه با یقه قایقی",
      slug: "tiered-summer-maxi-dress",
      description: "پیراهن خنک ساحلی و تابستانه با یقه قایقی کش‌دوزی، آستین کیمونو کوتاه و دامن ۳ طبقه چین‌سوزنی با افت ریزشی زیبا.",
      category: "DRESSES",
      baseBlock: BlockType.BODICE,
      draftingMethod: DraftingMethod.GRLAWEIN,
      fitType: FitType.LOOSE,
      difficulty: Difficulty.BEGINNER,
      price: 120000,
      coverImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["بابوس", "وال خنک نخی", "ابروبادی", "لینن اسلپ"],
        bolt150cmLengthMeters: 2.5,
        bolt110cmLengthMeters: 3.8,
        notes: "پارچه‌های لخت با ریزش بالا بیشترین جلوه را در این الگو دارند.",
      },
      parametricConfig: {
        baseBlock: "BODICE",
        method: "GRLAWEIN",
        easeOffsets: { bust: 10.0, waist: 12.0, hip: 14.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "طراحی بالاتنه آزاد کیمونو",
          description: "متصل کردن آستین کوتاه به حلقه بالاتنه و باز کردن خط یقه قایقی.",
          technicalDetails: { neckDropCm: 3, neckWidenCm: 6 },
        },
        {
          stepOrder: 2,
          title: "محاسبه طبقات چین‌دار دامن",
          description: "محاسبه طول طبقات ۱.۵ و ۲ برابری نسبت به دور کمر برای چین‌کش کردن.",
          technicalDetails: { gatherRatioTier1: 1.5, gatherRatioTier2: 2.0 },
        },
      ],
      reviews: [
        {
          rating: 4,
          fitFeedback: "RUNS_LARGE",
          title: "بسیار خنک و دوخت سریع",
          comment: "برای تابستان عالی است، مقدار چین طبقه آخر را کمی کمتر گرفتم تا سبکتر شود.",
        },
      ],
    },
    {
      title: "بارانی ترنچ کژوال با آستین رگلان و کمربند",
      slug: "casual-trench-coat-raglan",
      description: "بارانی ترنچ کژوال با آستین رگلان راحت، جلو دو ردیف دکمه (Double Breasted)، نقاب ضدباران در پشت و مچی بنددار.",
      category: "OUTERWEAR",
      baseBlock: BlockType.BODICE,
      draftingMethod: DraftingMethod.MULLER,
      fitType: FitType.LOOSE,
      difficulty: Difficulty.ADVANCED,
      price: 390000,
      coverImage: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["مموری ضدآب", "بارانی شمعی", "گاباردین پشمی"],
        bolt150cmLengthMeters: 2.6,
        bolt110cmLengthMeters: 4.0,
        liningLengthMeters: 2.0,
        interfacingMeters: 1.0,
        notes: "برای درزها از چسب درزگیر مخصوص پارچه‌های ضدآب استفاده فرمایید.",
      },
      parametricConfig: {
        baseBlock: "BODICE",
        method: "MULLER",
        easeOffsets: { bust: 10.0, waist: 10.0, hip: 12.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "تبدیل آستین ساده به رگلان",
          description: "قرار دادن تاج آستین در کنار سرشانه بالاتنه و انتقال خط برش به یقه.",
          technicalDetails: { raglanAngleDeg: 45 },
        },
        {
          stepOrder: 2,
          title: "طراحی جلو چهار دکمه و نقاب پشت",
          description: "اضافه کردن ۸ سانتی‌متر روی‌هم‌گرد (Overlap) در خط مرکزی جلو و رسم نقاب شیب‌دار پشت.",
          technicalDetails: { doubleBreastedOverlapCm: 8 },
        },
      ],
      reviews: [
        {
          rating: 5,
          fitFeedback: "TRUE_TO_SIZE",
          title: "آستین رگلان فوق‌العاده راحت و مدرن",
          comment: "آزادی زیر بغل آستین رگلان در متد مولر بسیار خوب محاسبه شده و دست به راحتی حرکت می‌کند.",
        },
      ],
    },
    {
      title: "شلوار واید لگ فاق بلند با پیلی دوقلو",
      slug: "high-waisted-wide-leg-pants",
      description: "شلوار مدرن واید لگ با کمر کرستی پهن ۵ سانتی‌متری، دو پیلی عمیق ۲.۵ سانتی‌متری در پیش و امتداد آزاد و لخت تا لبه دمپا.",
      category: "TROUSERS",
      baseBlock: BlockType.TROUSER,
      draftingMethod: DraftingMethod.METRIC,
      fitType: FitType.LOOSE,
      difficulty: Difficulty.INTERMEDIATE,
      price: 260000,
      coverImage: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800",
      galleryImages: ["https://images.unsplash.com/photo-1551803091-e20673f15770?w=800"],
      fabricRequirements: {
        recommendedFabrics: ["کرپ مازراتی سنگین", "لینن والنتینو", "فاستونی ترک"],
        bolt150cmLengthMeters: 1.5,
        bolt110cmLengthMeters: 2.6,
        interfacingMeters: 0.3,
        notes: "نیاز به پارچه با ریزش بالا دارد تا پیلی‌ها ایستایی شیکی داشته باشند.",
      },
      parametricConfig: {
        baseBlock: "TROUSER",
        method: "METRIC",
        easeOffsets: { waist: 1.5, hip: 6.0 },
      },
      steps: [
        {
          stepOrder: 1,
          title: "بلند کردن فاق و طراحی کمری کرستی",
          description: "افزایش ۳ سانتی‌متر به بلندی فاق و رسم کمری پهن فرم‌دار.",
          technicalDetails: { highWaistRiseExtensionCm: 3 },
        },
        {
          stepOrder: 2,
          title: "ایجاد پیلی دوقلو در خط اتو جلو",
          description: "باز کردن دو اوزمان ۵ سانتی‌متری برای تا زدن پیلی دوقلو به سمت پهلو.",
          technicalDetails: { pleatDepthCm: 5.0 },
        },
        {
          stepOrder: 3,
          title: "گسترش موازی لنگه شلوار تا دمپا",
          description: "رسم خطوط مستقیم از باسن بزرگ تا دمپا به عرض ۳۲ سانتی‌متر در دمپا.",
          technicalDetails: { hemWidthCm: 32 },
        },
      ],
      reviews: [
        {
          rating: 5,
          fitFeedback: "TRUE_TO_SIZE",
          title: "استایل بسیار ترند و کشیده",
          comment: "قد پا را بسیار کشیده نشان می‌دهد و پیلی‌ها بعد از اتو عالی ایستادند.",
        },
      ],
    },
  ];

  for (const p of patternsData) {
    const { steps, reviews, ...patternFields } = p;

    const pattern = await prisma.patternProduct.create({
      data: {
        ...patternFields,
        creatorId: creatorUser.id,
        technicalFlatFront: sampleFlatSvgFront,
        technicalFlatBack: sampleFlatSvgBack,
        isPublished: true,
        salesCount: reviews.length > 0 ? 1 : 0,
        steps: {
          create: steps.map((s) => ({
            stepOrder: s.stepOrder,
            title: s.title,
            description: s.description,
            technicalDetails: s.technicalDetails ?? {},
          })),
        },
      },
    });

    // Add verified reviews from tailorUser
    for (const r of reviews) {
      // 1. Create Purchase record first to ensure review validity
      const purchase = await prisma.purchase.create({
        data: {
          userId: tailorUser.id,
          patternId: pattern.id,
          pricePaid: pattern.price,
          transactionRef: `SEED_TX_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          status: PurchaseStatus.COMPLETED,
        },
      });

      // 2. Create Review record
      await prisma.review.create({
        data: {
          userId: tailorUser.id,
          patternId: pattern.id,
          rating: r.rating,
          fitFeedback: r.fitFeedback,
          title: r.title,
          comment: r.comment,
        },
      });

      // 3. Create double-entry ledger transactions if pattern is paid
      if (pattern.price > 0) {
        const creatorEarning = Math.floor(pattern.price * 0.8);
        const platformCommission = pattern.price - creatorEarning;

        await prisma.walletTransaction.create({
          data: {
            userId: creatorUser.id,
            amount: creatorEarning,
            type: TransactionType.CREDIT,
            balanceAfter: creatorUser.walletBalance,
            referenceId: purchase.id,
            description: `درآمد حاصل از فروش الگوی ${pattern.title} (سهم ۸۰٪ سازنده)`,
          },
        });

        await prisma.walletTransaction.create({
          data: {
            userId: adminUser.id,
            amount: platformCommission,
            type: TransactionType.COMMISSION,
            balanceAfter: platformCommission,
            referenceId: purchase.id,
            description: `کارمزد پلتفرم دوز از فروش الگوی ${pattern.title} (سهم ۲۰٪ پلتفرم)`,
          },
        });
      }
    }
  }

  console.log("✅ Created 8 Rich Marketplace Patterns with Steps, Purchases & Reviews");

  // =========================================================================
  // 6. Sample Payout Request & Saved Draft
  // =========================================================================
  await prisma.payoutRequest.create({
    data: {
      creatorId: creatorUser.id,
      amount: 500000, // 500,000 Toman
      shebaNumber: "IR060560000000012345678901",
      accountHolderName: "مهسا رادمنش",
      bankName: "بانک سامان",
      status: PayoutStatus.PENDING,
      adminNotes: "درخواست تسویه هفتگی سهم فروش الگوها",
    },
  });

  await prisma.savedDraft.create({
    data: {
      userId: tailorUser.id,
      clientId: clientMaryam.id,
      title: "پیش‌نویس بالاتنه ساسون‌دار متد مولر - مریم احمدی",
      baseBlock: BlockType.BODICE,
      method: DraftingMethod.MULLER,
      measurements: clientMaryam.measurements as object,
      adjustments: {
        swayback: true,
        prominentAbdomen: true,
        shoulderSlope: "NORMAL",
        fitPreference: "LOOSE",
      },
      studioState: {
        activeStep: 3,
        zoomLevel: 1.2,
        visibleLayers: ["construction", "contour", "darts", "annotations"],
      },
    },
  });

  console.log("✅ Created Sample Payout Request and Saved Studio Draft");
  console.log("🎉 Seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
