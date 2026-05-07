import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/features/footer/components/Footer";
import { FooterFallback } from "@/features/footer/components/FooterFallback";
import { Header } from "@/features/header/components/Header";
import { HeaderFallback } from "@/features/header/components/HeaderFallback";
import { getFooter } from "@/server/domains/footer/footer.service";
import { getHeader } from "@/server/domains/header/header.service";
import { logger } from "@/server/observability/logger";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DwyerOmega",
  description:
    "DwyerOmega — measurement equipment and services for industry.",
};

async function SiteHeader() {
  try {
    const data = await getHeader();
    return <Header data={data} />;
  } catch (err) {
    logger.error({ err }, "header.fetch-failed");
    return <HeaderFallback />;
  }
}

async function SiteFooter() {
  try {
    const data = await getFooter();
    return <Footer data={data} />;
  } catch (err) {
    logger.error({ err }, "footer.fetch-failed");
    return <FooterFallback />;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
