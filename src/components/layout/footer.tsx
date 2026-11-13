import Link from "next/link";
import { Scissors, Heart } from "lucide-react";
import { formatJalaliDate } from "@/lib/format";

export function Footer() {
  const currentYear = formatJalaliDate(new Date(), { year: "numeric" });

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">دوز (Dooz)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              سامانه یکپارچه الگوسازی پارامتریک، پرونده اندازه‌گیری مشتریان خیاطی و مارکت‌پلیس دوطرفه الگو در ایران. محاسبات هندسی دقیق با خروجی چاپ سایز واقعی ۱:۱.
            </p>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">بخش‌های سامانه</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/studio" className="hover:text-primary transition-colors">استودیو پارامتریک الگو</Link>
              </li>
              <li>
                <Link href="/clients" className="hover:text-primary transition-colors">مدیریت مشتریان و اندازه‌ها</Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-primary transition-colors">فروشگاه و مارکت‌پلیس الگوها</Link>
              </li>
              <li>
                <Link href="/ai-analyzer" className="hover:text-primary transition-colors">آنالیز هوشمند لباس با هوش مصنوعی</Link>
              </li>
              <li>
                <Link href="/creator" className="hover:text-primary transition-colors">پنل طراحان و درآمدزایی</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Drafting Methods */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">متدهای الگوسازی</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>متد مولر آلمان (Müller) — دقت و برازش عالی</li>
              <li>متد متریک انگلیس (Metric) — استاندارد صنعتی</li>
              <li>متد گرلاوین (Grlawein) — سادگی و بومی‌سازی</li>
              <li>تطبیق عیوب اندامی (شکم، گودی کمر، شانه)</li>
              <li>خروجی PDF پلاتر A0 و کاشی‌بندی A4 شابلون‌دار</li>
            </ul>
          </div>

          {/* Col 4: Standards & Integrity */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">استانداردها و تضمین‌ها</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>مقیاس چاپ ۱:۱ به همراه مربع کالیبراسیون ۵×۵ سانتی‌متر</li>
              <li>محاسبه خودکار متراژ پارچه برای عرض‌های ۱۱۰ و ۱۵۰ سانتی‌متر</li>
              <li>تسهیم منصفانه ۸۰٪ سهم طراح / ۲۰٪ کارمزد پلتفرم</li>
              <li>تسویه حساب مستقیم بانکی از طریق شماره شبا</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {currentYear} دوز. تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-1">
            طراحی‌شده با <Heart className="h-3 w-3 text-red-500 fill-red-500" /> برای جامعه خیاطان و طراحان ایران
          </p>
        </div>
      </div>
    </footer>
  );
}
