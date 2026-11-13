import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: "دوز (Dooz) | سامانه تخصصی الگوسازی پارامتریک و مارکت‌پلیس الگو",
  description:
    "استودیو محاسبات دقیق الگوهای خیاطی با متدهای مولر، متریک و گرلاوین، پرونده مشتریان، مارکت‌پلیس الگو، دستیار هوش مصنوعی و خروجی چاپ ۱:۱.",
  keywords: [
    "الگوسازی خیاطی",
    "متد مولر",
    "متد متریک",
    "گرلاوین",
    "مارکت پلیس الگو",
    "پرونده خیاطی",
    "خروجی A4 الگو",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
