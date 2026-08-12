const fs = require('fs');
let code = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf-8');

// Insert import
code = code.replace("import React, { createContext, useContext, useState, useEffect } from 'react';", "import React, { createContext, useContext, useState, useEffect } from 'react';\nimport { getSettings } from '../lib/settings';");

// Insert state and effect in LanguageProvider
const providerStart = "export function LanguageProvider({ children }: { children: React.ReactNode }) {\n";
const stateCode = `  const [customTranslations, setCustomTranslations] = useState<Record<string, Record<string, string>>>({ fr: {}, en: {} });
  
  useEffect(() => {
    getSettings().then(settings => {
      if (settings.translations) {
        setCustomTranslations(settings.translations);
      }
    });
    
    // Listen for custom event when settings are saved
    const handleSettingsUpdate = () => {
      getSettings().then(settings => {
        if (settings.translations) {
          setCustomTranslations(settings.translations);
        }
      });
    };
    window.addEventListener('yamtv_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('yamtv_settings_updated', handleSettingsUpdate);
  }, []);\n\n`;

code = code.replace(providerStart, providerStart + stateCode);

// Update t function
const tFunc = `  const t = (key: string) => {
    return translations[lang][key] || key;
  };`;
const newTFunc = `  const t = (key: string) => {
    return customTranslations[lang]?.[key] || translations[lang][key] || key;
  };`;

code = code.replace(tFunc, newTFunc);

fs.writeFileSync('src/contexts/LanguageContext.tsx', code);
