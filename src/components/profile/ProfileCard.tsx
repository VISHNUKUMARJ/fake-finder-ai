
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Calendar, Pencil, Upload } from "lucide-react";

interface ProfileCardProps {
  userData: any;
  saveUserData: (updatedData: any) => boolean;
}

export const ProfileCard = ({ userData, saveUserData }: ProfileCardProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userData.name || "");
  const [profileImage, setProfileImage] = useState<string | null>(userData.profileImage || null);
  const { toast } = useToast();
  
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

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
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
  );
};
