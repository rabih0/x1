import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Invoice Web App",
  description: "Manage your invoices easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <I18nProvider>
          <Navigation />
          <main className="pt-24">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
