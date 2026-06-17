import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import LayoutShell from "@/components/LayoutShell";
import { ThemeProvider } from "@/lib/ThemeContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arpittiwari.design";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080809",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arpit Tiwari — UI/UX Designer",
    template: "%s | Arpit Tiwari",
  },
  description:
    "UI/UX Designer specializing in mobile apps, e-commerce, and product UI. Based in Surat, Gujarat, India.",
  keywords: ["UI/UX Designer", "Figma", "Mobile App Design", "E-commerce Design", "Product Design", "Surat"],
  authors: [{ name: "Arpit Tiwari", url: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tarpit771@gmail.com"}` }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Arpit Tiwari Portfolio",
    title: "Arpit Tiwari — UI/UX Designer",
    description: "UI/UX Designer specializing in mobile apps, e-commerce, and product UI.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Arpit Tiwari — UI/UX Designer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arpit Tiwari — UI/UX Designer",
    description: "UI/UX Designer specializing in mobile apps, e-commerce, and product UI.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-text-1 antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6HW9BGFN97"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6HW9BGFN97');
          `}
        </Script>
        <ThemeProvider>
          <CustomCursor />
          <LayoutShell>{children}</LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
