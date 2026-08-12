export interface SiteSettings {
  breaking_text: string;
  translations?: Record<string, Record<string, string>>;
}

const defaultSettings: SiteSettings = {
  breaking_text: "Le gouvernement annonce de nouvelles mesures économiques pour soutenir la croissance. | La sélection nationale se qualifie pour la finale du championnat régional. | Cérémonie d'ouverture du festival international du film ce soir.",
  translations: { fr: {}, en: {} }
};

export const getSettings = async (): Promise<SiteSettings> => {
  const local = localStorage.getItem('yamtv_settings');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return {
        breaking_text: parsed.breaking_text || defaultSettings.breaking_text,
        translations: parsed.translations || defaultSettings.translations
      };
    } catch (e) {}
  }
  return defaultSettings;
};

export const saveSettings = async (settings: SiteSettings) => {
  try {
    localStorage.setItem('yamtv_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('yamtv_settings_updated'));
  } catch (e) {}
};
