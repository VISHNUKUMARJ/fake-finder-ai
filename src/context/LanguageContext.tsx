
import { createContext, useContext, useState, ReactNode } from "react";

// Define translations
const translations: Record<string, Record<string, string>> = {
  english: {
    appearance: "Appearance",
    customizeAppearance: "Customize how FakeFinder looks on your device",
    darkMode: "Dark Mode",
    switchThemes: "Switch between light and dark themes",
    language: "Language",
    chooseLanguage: "Choose your preferred language",
    displayLanguage: "Display Language",
    selectLanguage: "Select your preferred language",
    account: "Account",
    manageAccount: "Manage your account settings",
    logout: "Logout",
    loggedOut: "Logged out",
    loggedOutMessage: "You've been successfully logged out.",
    languageUpdated: "Language updated",
    languageSetTo: "Language set to",
    themeUpdated: "Theme updated",
    themeSetTo: "Theme set to",
  },
  spanish: {
    appearance: "Apariencia",
    customizeAppearance: "Personaliza cómo se ve FakeFinder en tu dispositivo",
    darkMode: "Modo Oscuro",
    switchThemes: "Alterna entre temas claros y oscuros",
    language: "Idioma",
    chooseLanguage: "Elige tu idioma preferido",
    displayLanguage: "Idioma de Visualización",
    selectLanguage: "Selecciona tu idioma preferido",
    account: "Cuenta",
    manageAccount: "Administra la configuración de tu cuenta",
    logout: "Cerrar Sesión",
    loggedOut: "Sesión cerrada",
    loggedOutMessage: "Has cerrado sesión correctamente.",
    languageUpdated: "Idioma actualizado",
    languageSetTo: "Idioma establecido en",
    themeUpdated: "Tema actualizado",
    themeSetTo: "Tema establecido en",
  },
  french: {
    appearance: "Apparence",
    customizeAppearance: "Personnalisez l'apparence de FakeFinder sur votre appareil",
    darkMode: "Mode Sombre",
    switchThemes: "Basculer entre les thèmes clair et sombre",
    language: "Langue",
    chooseLanguage: "Choisissez votre langue préférée",
    displayLanguage: "Langue d'Affichage",
    selectLanguage: "Sélectionnez votre langue préférée",
    account: "Compte",
    manageAccount: "Gérez les paramètres de votre compte",
    logout: "Déconnexion",
    loggedOut: "Déconnecté",
    loggedOutMessage: "Vous avez été déconnecté avec succès.",
    languageUpdated: "Langue mise à jour",
    languageSetTo: "Langue définie sur",
    themeUpdated: "Thème mis à jour",
    themeSetTo: "Thème défini sur",
  },
};

// Create the context with its type
export const LanguageContext = createContext<{
  language: string;
  setLanguage: (language: string) => void;
  translate: (key: string) => string;
}>({
  language: 'english',
  setLanguage: () => {},
  translate: (key) => key,
});

// Create the provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>(
    localStorage.getItem("fakefinder_language") || "english"
  );

  const setLanguage = (newLanguage: string) => {
    localStorage.setItem("fakefinder_language", newLanguage);
    setLanguageState(newLanguage);
  };

  const translate = (key: string): string => {
    return translations[language]?.[key] || translations.english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a hook for easy access to the context
export const useLanguage = () => useContext(LanguageContext);
