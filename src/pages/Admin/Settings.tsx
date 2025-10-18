// src/pages/Admin/Settings.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Save,
  Hotel,
  MapPin,
  Phone,
  Mail,
  Clock,
  Wifi,
  Shield,
  Globe,
  RefreshCcw,
  Undo2,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";
import type { HotelSettings } from "../../types/admin";

/* --- listes pratiques --- */
const CURRENCIES = ["MAD", "EUR", "USD", "GBP", "AED", "JPY"];
const TIMEZONES = [
  "Africa/Casablanca",
  "Europe/Paris",
  "UTC",
  "America/New_York",
  "Asia/Dubai",
  "Asia/Tokyo",
];

const DEFAULTS: HotelSettings = {
  id: "1",
  hotelName: "Nobu Hotel Marrakech",
  address: "Avenue Mohammed VI, Marrakech",
  phone: "+212 524 42 46 00",
  email: "contact@nobumarrakech.com",
  checkInTime: "15:00",
  checkOutTime: "12:00",
  currency: "MAD",
  timezone: "Africa/Casablanca",
  wifiPassword: "NobuGuest_Free",
  emergencyNumber: "911",
  updatedAt: new Date().toISOString(),
};

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<HotelSettings>(DEFAULTS);
  const [initial, setInitial] = useState<HotelSettings>(DEFAULTS);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [valid, setValid] = useState<Record<string, string>>({});

  // pour empêcher une perte involontaire
  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initial),
    [settings, initial]
  );
  const mounted = useRef(false);

  /* ------------------ LOAD ------------------ */
  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingPage(true);
      try {
        const serverSettings = await apiService.getAdminSettings();
        const merged = { ...DEFAULTS, ...(serverSettings || {}) };
        setSettings(merged);
        setInitial(merged);
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger les paramètres");
      } finally {
        setLoadingPage(false);
        mounted.current = true;
      }
    };
    fetchSettings();
  }, []);

  /* ------------------ VALIDATION ------------------ */
  useEffect(() => {
    if (!mounted.current) return;
    const errors: Record<string, string> = {};
    if (!settings.hotelName?.trim()) errors.hotelName = "Nom requis";
    if (!settings.address?.trim()) errors.address = "Adresse requise";
    if (!/^\+?[0-9\s-]+$/.test(settings.phone || "")) errors.phone = "Téléphone invalide";
    if (!/^\S+@\S+\.\S+$/.test(settings.email || "")) errors.email = "Email invalide";
    if (!settings.checkInTime) errors.checkInTime = "Obligatoire";
    if (!settings.checkOutTime) errors.checkOutTime = "Obligatoire";
    if (!settings.currency) errors.currency = "Sélectionnez une devise";
    if (!settings.timezone) errors.timezone = "Sélectionnez un fuseau";
    if (!settings.wifiPassword) errors.wifiPassword = "Obligatoire";
    if (!settings.emergencyNumber) errors.emergencyNumber = "Obligatoire";
    setValid(errors);
  }, [settings]);

  /* ------------------ HANDLERS ------------------ */
  const onChange = (key: keyof HotelSettings, value: string) =>
    setSettings((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (Object.keys(valid).length > 0) {
      toast.error("Corrigez les champs invalides.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...settings, updatedAt: new Date().toISOString() };
      await apiService.updateAdminSettings(payload);
      setSettings(payload);
      setInitial(payload);
      toast.success("Paramètres sauvegardés 🎉");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const resetToInitial = () => {
    setSettings(initial);
    toast("Modifications annulées", { icon: "↩️" });
  };

  const resetToDefaults = () => {
    setSettings(DEFAULTS);
    toast("Valeurs par défaut chargées", { icon: "🧹" });
  };

  /* ------------------ UI ------------------ */
  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres de l'Hôtel</h1>
          <p className="text-gray-600">Configuration générale et préférences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToInitial} disabled={!isDirty || saving}>
            <Undo2 size={18} className="mr-2" />
            Annuler
          </Button>
          <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
            <RefreshCcw size={18} className="mr-2" />
            Par défaut
          </Button>
          <Button variant="primary" loading={saving} disabled={!isDirty || saving} onClick={handleSave}>
            <Save size={20} className="mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infos Générales */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Hotel className="text-orange-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Informations Générales</h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Nom de l'hôtel"
              icon={Hotel}
              value={settings.hotelName}
              onChange={(e) => onChange("hotelName", e.target.value)}
              error={valid.hotelName}
            />
            <Input
              label="Adresse"
              icon={MapPin}
              value={settings.address}
              onChange={(e) => onChange("address", e.target.value)}
              error={valid.address}
            />
            <Input
              label="Téléphone"
              icon={Phone}
              value={settings.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              error={valid.phone}
            />
            <Input
              label="Email"
              icon={Mail}
              value={settings.email}
              onChange={(e) => onChange("email", e.target.value)}
              error={valid.email}
            />
          </div>
        </Card>

        {/* Horaires & Politique */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Horaires & Politique</h3>
          </div>

          <div className="space-y-4">
            <Input
              type="time"
              label="Heure d'arrivée"
              icon={Clock}
              value={settings.checkInTime}
              onChange={(e) => onChange("checkInTime", e.target.value)}
              error={valid.checkInTime}
            />
            <Input
              type="time"
              label="Heure de départ"
              icon={Clock}
              value={settings.checkOutTime}
              onChange={(e) => onChange("checkOutTime", e.target.value)}
              error={valid.checkOutTime}
            />

            {/* Devise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-gray-400" />
                <select
                  value={settings.currency}
                  onChange={(e) => onChange("currency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {valid.currency && <p className="text-xs text-red-600 mt-1">{valid.currency}</p>}
            </div>

            {/* Fuseau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-gray-400" />
                <select
                  value={settings.timezone}
                  onChange={(e) => onChange("timezone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              {valid.timezone && <p className="text-xs text-red-600 mt-1">{valid.timezone}</p>}
            </div>
          </div>
        </Card>

        {/* Sécurité & Accès */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-green-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Sécurité & Accès</h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Réseau WiFi"
              icon={Wifi}
              value={settings.wifiPassword}
              onChange={(e) => onChange("wifiPassword", e.target.value)}
              error={valid.wifiPassword}
            />
            <Input
              label="Numéro d'urgence"
              icon={Phone}
              value={settings.emergencyNumber}
              onChange={(e) => onChange("emergencyNumber", e.target.value)}
              error={valid.emergencyNumber}
            />
          </div>
        </Card>
      </div>

      {/* Informations système */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Système</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-medium text-gray-900 mb-1">Version</div>
            <div className="text-gray-600">v1.0.0</div>
          </div>
          <div>
            <div className="font-medium text-gray-900 mb-1">Dernière mise à jour</div>
            <div className="text-gray-600">
              {new Date(settings.updatedAt || new Date().toISOString()).toLocaleDateString("fr-FR")}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 mb-1">Statut</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600">Opérationnel</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions rapides (exemples) */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              navigator.clipboard.writeText(settings.wifiPassword || "");
              toast.success("Mot de passe Wi-Fi copié");
            }}
          >
            <Shield size={16} className="mr-2" />
            Copier mot de passe Wi-Fi
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              toast("Bientôt disponible…", { icon: "🌍" });
            }}
          >
            <Globe size={16} className="mr-2" />
            Changer la langue
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => toast.success("Cache réinitialisé")}
          >
            <Clock size={16} className="mr-2" />
            Réinitialiser le cache
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => toast.success("Email de test envoyé")}
          >
            <Mail size={16} className="mr-2" />
            Envoyer un email test
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;