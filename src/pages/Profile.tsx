
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Search, AlertCircle, ImageIcon, FileVideo, FileAudio, FileText, AlertTriangle, CheckCircle2, Pencil, Upload } from "lucide-react";
import { getSearchHistory, SearchHistoryItem } from "@/utils/historyManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    
    // Get all users to find the current user's complete data
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userWithHistory = allUsers.find((user: any) => user.email === currentUser.email) || {};
    
    setUserData(userWithHistory);
    setNewName(userWithHistory.name || "");
    setProfileImage(userWithHistory.profileImage || null);
    
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

  const saveUserData = (updatedData: any) => {
    try {
      // Get current user email
      const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
      const userEmail = currentUser.email;
      
      // Get all users
      const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
      const userIndex = allUsers.findIndex((user: any) => user.email === userEmail);
      
      if (userIndex !== -1) {
        // Update user data
        allUsers[userIndex] = {
          ...allUsers[userIndex],
          ...updatedData
        };
        
        // Save updated users data
        localStorage.setItem("fakefinder_users", JSON.stringify(allUsers));
        
        // Update current user data if name changed
        if (updatedData.name) {
          currentUser.name = updatedData.name;
          localStorage.setItem("fakefinder_user", JSON.stringify(currentUser));
        }
        
        // Update local state
        setUserData({
          ...userData,
          ...updatedData
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  };

  const handleNameSave = () => {
    if (newName.trim()) {
      const success = saveUserData({ name: newName.trim() });
      if (success) {
        toast({
          title: "Name updated",
          description: "Your profile name has been updated."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: "Failed to update profile name."
        });
      }
    }
    setIsEditingName(false);
  };
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const success = saveUserData({ profileImage: imageUrl });
        if (success) {
          setProfileImage(imageUrl);
          toast({
            title: "Profile image updated",
            description: "Your profile image has been updated."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Update failed",
            description: "Failed to update profile image."
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer group relative">
                  <AvatarImage src={profileImage || ""} alt={userData.name || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </Avatar>
                <Input 
                  type="file" 
                  id="profile-image" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                  onClick={() => document.getElementById('profile-image')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start">
                  {isEditingName ? (
                    <div className="flex gap-2 items-center">
                      <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="max-w-[250px]"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleNameSave}>Save</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(userData.name || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CardTitle className="text-2xl">{userData.name || "User"}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => setIsEditingName(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
