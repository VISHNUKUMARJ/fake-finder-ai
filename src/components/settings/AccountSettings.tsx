
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translate } = useLanguage();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("fakefinder_isLoggedIn");
      localStorage.removeItem("fakefinder_user");
      
      await supabase.auth.signOut();
      
      toast({
        title: translate("loggedOut"),
        description: translate("loggedOutMessage"),
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 300);
      
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
