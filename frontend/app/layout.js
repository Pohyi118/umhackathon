import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./i18nContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "PeopleGraph — Decision-Support HR Platform",
  description:
    "AI-powered HR analytics and compliance automation for Malaysian SMEs. EPF, SOCSO, EIS, PCB — all in one dashboard.",
  keywords: "HR, Malaysia, EPF, SOCSO, payroll, analytics, SME",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
