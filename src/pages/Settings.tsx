
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Sun, Moon, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";

export const LanguageContext = createContext<{
  language: string;
  setLanguage: (language: string) => void;
  translate: (key: string) => string;
}>({
  language: 'english',
  setLanguage: () => {},
  translate: (key) => key,
});

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

const createThemeManager = () => {
  const getTheme = () => localStorage.getItem("fakefinder_theme") || "light";
  
  const setTheme = (theme: string) => {
    localStorage.setItem("fakefinder_theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  return { getTheme, setTheme };
};

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

export const useLanguage = () => useContext(LanguageContext);

const Settings = () => {
  const themeManager = createThemeManager();
  const [theme, setTheme] = useState(themeManager.getTheme());
  const { language, setLanguage, translate } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useTrainableDetection();

  useEffect(() => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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

        {isAdmin && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Admin Settings</CardTitle>
                <CardDescription>Manage administrative privileges</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { promoteToAdmin } = useTrainableDetection();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    const success = await promoteToAdmin(userId);
    
    if (success) {
      toast({
        title: "User promoted",
        description: `${userName} is now an admin`,
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: true } : user
      ));
    } else {
      toast({
        title: "Promotion failed",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">User Management</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      User
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {!user.is_admin && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePromoteToAdmin(user.id, user.name || user.email)}
                    >
                      Make Admin
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Settings;
