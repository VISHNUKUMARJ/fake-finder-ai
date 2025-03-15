
import { useState, useEffect, createContext, useContext } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define the LanguageContext
export const LanguageContext = createContext<{
  language: string;
  setLanguage: (language: string) => void;
  translate: (key: string) => string;
}>({
  language: 'english',
  setLanguage: () => {},
  translate: (key) => key,
});

// Translations
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
  // Add other languages as needed
};

// Create a ThemeProvider component
const createThemeManager = () => {
  const getTheme = () => localStorage.getItem("fakefinder_theme") || "light";
  
  const setTheme = (theme: string) => {
    localStorage.setItem("fakefinder_theme", theme);
    
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  return { getTheme, setTheme };
};

// Create a LanguageProvider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
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

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

const Settings = () => {
  const themeManager = createThemeManager();
  const [theme, setTheme] = useState(themeManager.getTheme());
  const { language, setLanguage, translate } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize theme
    themeManager.setTheme(theme);
  }, [theme]);
  
  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    themeManager.setTheme(newTheme);
    toast({
      title: translate("themeUpdated"),
      description: `${translate("themeSetTo")} ${newTheme} mode`,
    });
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: translate("languageUpdated"),
      description: `${translate("languageSetTo")} ${value}`,
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem("fakefinder_isLoggedIn");
    localStorage.removeItem("fakefinder_user");
    toast({
      title: translate("loggedOut"),
      description: translate("loggedOutMessage"),
    });
    navigate("/login");
  };
  
  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{translate("appearance")}</CardTitle>
            <CardDescription>
              {translate("customizeAppearance")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <Label htmlFor="theme-mode" className="text-base">
                    {translate("darkMode")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translate("switchThemes")}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{translate("language")}</CardTitle>
            <CardDescription>
              {translate("chooseLanguage")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Languages className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="language-select" className="text-base">
                    {translate("displayLanguage")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translate("selectLanguage")}
                  </p>
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]" id="language-select">
                  <SelectValue placeholder={translate("selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Español</SelectItem>
                  <SelectItem value="french">Français</SelectItem>
                  <SelectItem value="german">Deutsch</SelectItem>
                  <SelectItem value="chinese">中文</SelectItem>
                  <SelectItem value="japanese">日本語</SelectItem>
                  <SelectItem value="arabic">العربية</SelectItem>
                  <SelectItem value="hindi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{translate("account")}</CardTitle>
            <CardDescription>
              {translate("manageAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Separator />
              <div className="flex flex-col">
                <Button 
                  variant="destructive" 
                  className="mt-4 flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {translate("logout")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
