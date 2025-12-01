"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Navigation() {
  const { t } = useTranslation();

  return (
    <nav className="glass-dark fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            💼 {t("app.title")}
          </Link>

          <div className="flex gap-6 items-center">
            <Link
              href="/"
              className="text-white hover:text-blue-300 transition-colors"
            >
              {t("navigation.invoices")}
            </Link>
            <Link
              href="/clients"
              className="text-white hover:text-blue-300 transition-colors"
            >
              {t("navigation.clients")}
            </Link>
            <Link
              href="/tasks"
              className="text-white hover:text-blue-300 transition-colors"
            >
              {t("navigation.tasks")}
            </Link>
            <Link
              href="/company"
              className="text-white hover:text-blue-300 transition-colors"
            >
              {t("navigation.company")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
