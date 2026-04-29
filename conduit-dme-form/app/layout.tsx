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
          <header className="container pt-8 pb-6">
            <div className="flex items-center gap-2 text-foreground">
              <span className="inline-block h-6 w-6 rounded-full bg-primary" aria-hidden />
              <span className="text-base font-semibold tracking-tight">Conduit Health</span>
            </div>
          </header>
          <main className="container flex-1 pb-16">{children}</main>
          <footer className="container py-8 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Conduit Health. This form is for intake only and is not a guarantee of coverage.
          </footer>
        </div>
      </body>
    </html>
  );
}
