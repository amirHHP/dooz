import Link from "next/link";
import {
  Scissors,
  Ruler,
  ShoppingBag,
  Sparkles,
  Users,
  Printer,
  ChevronLeft,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { formatToman } from "@/lib/format";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>پلتفرم نسل جدید خیاطی و طراحی پوشاک در ایران</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
              انقلاب الگوسازی دقیق خیاطی با <span className="text-primary">محاسبات پارامتریک</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              دوز (Dooz) پلتفرم هوشمندی است که الگوهای پایه (دامن، بالاتنه، آستین و شلوار) را بر اساس متدهای مولر، متریک و گرلاوین، متناسب با اندازه‌های اختصاصی و عیوب اندامی هر مشتری، به صورت ریاضی و بدون تقریب ترسیم می‌کند.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:shadow-lg"
              >
                <Scissors className="h-5 w-5" />
                <span>ورود به استودیو الگوسازی</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span>کاوش در مارکت‌پلیس</span>
              </Link>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                خروجی ۱:۱ واقعی با مربع کالیبراسیون ۵cm
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                سازگار با پرینتر معمولی A4 و پلاتر A0
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                تطبیق عیوب اندامی در لحظه
              </span>
            </div>
          </div>

          {/* Interactive Hero Card Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-muted-foreground me-2">Dooz Studio CAD Engine</span>
                </div>
                <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold border border-emerald-200">
                  متد مولر (Müller)
                </span>
              </div>

              {/* Parametric preview block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">الگوی پایه فعال:</span>
                  <span className="font-bold text-foreground">بالاتنه پیش و پشت با ساسون سینه</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">دور سینه / دور کمر / دور باسن:</span>
                  <span className="font-mono font-medium text-foreground">96cm / 76cm / 102cm</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">تطبیق عیوب اندامی:</span>
                  <span className="inline-flex items-center gap-1 text-primary font-bold">
                    <span>شکم برجسته (+1.5cm)</span>
                    <span>•</span>
                    <span>گودی کمر (-1.0cm)</span>
                  </span>
                </div>
              </div>

              {/* Graphic Mock Canvas */}
              <div className="relative h-44 rounded-xl border bg-muted/40 p-3 flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center text-[11px] text-muted-foreground font-mono">
                  <span>A4 Tiled Grid (3 × 4 Pages)</span>
                  <span className="text-primary font-bold">Scale 100%</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative border-2 border-dashed border-primary/60 rounded-lg p-4 bg-background/80 flex items-center gap-3">
                    <Ruler className="h-6 w-6 text-primary animate-pulse" />
                    <div className="text-xs">
                      <p className="font-bold text-foreground">کالیبراسیون چاپ ۵×۵ سانتی‌متر</p>
                      <p className="text-[10px] text-muted-foreground">تضمین انطباق ۱۰۰٪ بدون کوچک‌نمایی پرینتر</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>خط مرکزی پشت (CB)</span>
                  <span className="text-emerald-600 font-bold">خط راستا (Grainline)</span>
                  <span>خط مرکزی جلو (CF)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">قیمت نسخه دمو:</span>
                <span className="font-bold text-primary">{formatToman(0)} (رایگان)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-foreground">
            پنج رکن اساسی پلتفرم <span className="text-primary">دوز</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:base max-w-xl mx-auto">
            ابزارهای طراحی‌شده برای پاسخ به نیازهای واقعی خیاطان شخصی‌دوز، مزون‌داران، و طراحان مد و لباس ایران.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Ruler className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۱. استودیو پارامتریک تعاملی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ترسیم بلادرنگ الگوها با پخش‌کننده مرحله‌به‌مرحله خطوط راهنما، محاسبات دقیق فرمول‌های خیاطی به سانتی‌متر، و خروجی باکیفیت SVG، DXF صنعتی و PDF.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۲. پرونده مشتریان خیاطی (CRM)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ثبت کامل ۲۶ اندازه آنتروپومتریک، برچسب‌های عیوب اندامی (شکم برجسته، گودی کمر، شانه افتاده) و دکمه تک‌کلیک بارگذاری مستقیم در استودیو.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۳. مارکت‌پلیس دوطرفه الگو</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              خرید و دانلود الگوهای آماده تجاری، محاسبه‌گر هوشمند مصرف پارچه (عرض ۱۱۰ و ۱۵۰ سانتی‌متر)، دیاگرام چیدمان الگو، و نظرات خریداران تاییدشده.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۴. تحلیل‌گر لباس با هوش مصنوعی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              آپلود تصویر لباس و تحلیل خودکار توسط Gemini Vision: استخراج سیلوئت، یقه، آستین، موقعیت ساسون‌ها و پیشنهاد الگوی پایه و متد پیشنهادی.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۵. استودیو و درآمدزایی طراحان</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              انتشار آسان الگوها با ویزارد ۵ مرحله‌ای، دفترکل دوبل مالی (۸۰٪ سهم طراح)، و درخواست تسویه حساب خودکار با بررسی اصالت شماره شبا بانکی.
            </p>
          </div>

          {/* Card 6 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۶. چاپ سایز واقعی و استاندارد صنعتی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              خروجی PDF کاشی‌بندی A4 با خطوط برش و خط‌کش راهنما برای چسباندن آسان در منزل، و فایل‌های DXF استاندارد ASTM D6673 برای دستگاه‌های برش لیزری و CNC.
            </p>
          </div>
        </div>
      </section>

      {/* Methods Comparison Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border bg-muted/30 p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              پشتیبانی از سه متد استاندارد الگوسازی
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              الگوی خود را با هر متدی که در آن تخصص دارید با فرمول‌های علمی و معتبر رسم کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-background p-6 space-y-3">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">دقت بالا</span>
              <h3 className="text-lg font-bold text-foreground">متد مولر (Müller)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                استاندارد معتبر آلمانی برای تنخورهای مجلسی و کت و شلوارهای خوش‌فرم با آزادی کنترل‌شده و تقسیمات دقیق بالاتنه.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6 space-y-3">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">استاندارد جهانی</span>
              <h3 className="text-lg font-bold text-foreground">متد متریک (Metric)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                متد سریع و صنعتی بریتانیا با جدول‌های استاندارد سایزبندی و رسم ساده‌تر برای تولید انبوه و پوشاک روزمره.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6 space-y-3">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">سادگی کاربردی</span>
              <h3 className="text-lg font-bold text-foreground">متد گرلاوین (Grlawein)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                متد سنتی و پرکاربرد در دوره‌های خیاطی ایران، رسم سریع بدون نیاز به محاسبات سنگین و تغییرات آسان روی الگو.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-l from-primary to-purple-800 p-8 sm:p-12 text-center text-primary-foreground space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            آماده‌اید تجربه الگوسازی خیاطی خود را متحول کنید؟
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
            بدون نیاز به نصب نرم‌افزارهای پیچیده CAD، الگوی خود را به صورت آنلاین و در چند دقیقه محاسبه و با مقیاس واقعی چاپ کنید.
          </p>
          <div className="pt-2">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-bold text-foreground shadow-lg hover:bg-background/90 transition-all hover:scale-105"
            >
              <Scissors className="h-5 w-5 text-primary" />
              <span>ورود رایگان به استودیو الگوسازی دوز</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
