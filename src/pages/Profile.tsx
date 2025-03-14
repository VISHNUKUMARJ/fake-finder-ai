
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Search, AlertCircle } from "lucide-react";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  
  useEffect(() => {
    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    
    // Get all users to find the current user's complete data including search history
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userWithHistory = allUsers.find((user: any) => user.email === currentUser.email) || {};
    
    setUserData(userWithHistory);
    setSearchHistory(userWithHistory.searchHistory || []);
  }, []);

  if (!userData) {
    return (
      <AppLayout title="Profile">
        <div className="flex items-center justify-center h-full">
          <p>Loading user data...</p>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <AppLayout title="Profile">
      <div className="space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={userData.name || ""} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <CardTitle className="text-2xl">{userData.name || "User"}</CardTitle>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center md:items-start text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {/* Search History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search History
            </CardTitle>
            <CardDescription>Your recent detection activities</CardDescription>
          </CardHeader>
          <CardContent>
            {searchHistory.length > 0 ? (
              <div className="space-y-4">
                {searchHistory.map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.type} Detection</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      {item.result ? (
                        <span className="text-red-500">Fake content detected</span>
                      ) : (
                        <span className="text-green-500">Authentic content</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 flex flex-col items-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                <p>No search history found</p>
                <p className="text-sm mt-1">
                  Your detection activities will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
