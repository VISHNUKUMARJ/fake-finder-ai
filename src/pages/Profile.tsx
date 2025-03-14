
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Search, AlertCircle, ImageIcon, FileVideo, FileAudio, FileText } from "lucide-react";
import { getSearchHistory, SearchHistoryItem } from "@/utils/historyManager";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  
  useEffect(() => {
    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    
    // Get all users to find the current user's complete data
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userWithHistory = allUsers.find((user: any) => user.email === currentUser.email) || {};
    
    setUserData(userWithHistory);
    
    // Load search history using the history manager
    setSearchHistory(getSearchHistory());
  }, []);

  // Refresh search history when component is focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setSearchHistory(getSearchHistory());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <FileVideo className="h-4 w-4" />;
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AppLayout title="Profile">
      <div className="space-y-6 max-w-4xl mx-auto">
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
              Detection History
            </CardTitle>
            <CardDescription>Your recent detection activities</CardDescription>
          </CardHeader>
          <CardContent>
            {searchHistory.length > 0 ? (
              <div className="space-y-4">
                {searchHistory.map((item) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <div className="font-medium flex items-center">
                        <span className="mr-2">{getTypeIcon(item.type)}</span>
                        <span className="capitalize">{item.type} Detection</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.date)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      {item.filename && (
                        <p className="text-muted-foreground truncate">
                          File: {item.filename}
                        </p>
                      )}
                      {item.textSnippet && (
                        <p className="text-muted-foreground truncate">
                          Text: "{item.textSnippet}"
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center">
                      {item.result ? (
                        <span className="text-red-500 flex items-center text-sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Manipulated content detected ({item.confidenceScore}% confidence)
                        </span>
                      ) : (
                        <span className="text-green-500 flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Authentic content ({item.confidenceScore}% confidence)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 flex flex-col items-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                <p>No detection history found</p>
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
