"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CompanyInfo, db } from "@/lib/db";

export default function CompanyForm() {
  const { t } = useTranslation();
  const [company, setCompany] = useState<CompanyInfo>({
    name: "",
    address: "",
    email: "",
    phone: "",
    vat: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const companies = await db.company.toArray();
      if (companies.length > 0) {
        setCompany(companies[0]);
      }
    } catch (error) {
      console.error("Error loading company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company.name.trim()) {
      alert("Firmenname ist erforderlich");
      return;
    }

    try {
      if (company.id) {
        await db.company.update(company.id, company);
      } else {
        await db.company.add(company);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadCompany();
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany({
          ...company,
          logo_base64: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass">
        <h2 className="text-2xl font-bold mb-6">{t("company.title")}</h2>

        {saved && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg text-green-700">
            {t("company.saved")}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.name")} *
            </label>
            <input
              type="text"
              value={company.name}
              onChange={(e) =>
                setCompany({ ...company, name: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.address")}
            </label>
            <input
              type="text"
              value={company.address || ""}
              onChange={(e) =>
                setCompany({ ...company, address: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.email")}
            </label>
            <input
              type="email"
              value={company.email || ""}
              onChange={(e) =>
                setCompany({ ...company, email: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.phone")}
            </label>
            <input
              type="tel"
              value={company.phone || ""}
              onChange={(e) =>
                setCompany({ ...company, phone: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.vat")}
            </label>
            <input
              type="text"
              value={company.vat || ""}
              onChange={(e) =>
                setCompany({ ...company, vat: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.website")}
            </label>
            <input
              type="url"
              value={company.website || ""}
              onChange={(e) =>
                setCompany({ ...company, website: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("company.logo")}
            </label>
            {company.logo_base64 && (
              <div className="mb-4">
                <img
                  src={company.logo_base64}
                  alt="Company Logo"
                  className="max-h-32 mb-2"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="input-field"
            />
          </div>

          <button onClick={handleSave} className="button-primary w-full">
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
