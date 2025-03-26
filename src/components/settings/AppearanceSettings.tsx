
import { useState, useEffect } from "react";
import { Sun, Moon, Languages } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { createThemeManager } from "@/utils/themeManager";

export const AppearanceSettings = () => {
  const themeManager = createThemeManager();
  const [theme, setTheme] = useState(themeManager.getTheme());
  const { language, setLanguage, translate } = useLanguage();
  const { toast } = useToast();

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

  return (
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
    </div>
  );
};
