import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Request Medical Supplies — Conduit Health",
  description:
    "Tell us what supplies or equipment you need. A Conduit Health care coordinator will reach out within one business day.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <div className="min-h-dvh flex flex-col">
          <header className="container pt-8 pb-4">
            <a href="/" className="inline-flex items-center gap-2.5 text-foreground group">
              <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </span>
              <span className="text-base font-semibold tracking-tight">Conduit Health</span>
            </a>
          </header>
          <main className="container flex-1 pb-16">{children}</main>
          <footer className="container py-8 text-xs text-muted-foreground border-t border-border/50 mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>© {new Date().getFullYear()} Conduit Health</span>
              <span>This form is for intake only and is not a guarantee of coverage.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
