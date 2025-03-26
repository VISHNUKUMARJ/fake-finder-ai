
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { LanguageProvider } from "@/context/LanguageContext";

// Re-export for backward compatibility
export { LanguageProvider } from "@/context/LanguageContext";

const Settings = () => {
  const { isAdmin } = useTrainableDetection();

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="account">
              Account
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin">
                Admin Dashboard
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6">
            <AppearanceSettings />
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="admin">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
