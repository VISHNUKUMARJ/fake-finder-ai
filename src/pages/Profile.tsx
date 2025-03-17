
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SearchHistoryList } from "@/components/profile/SearchHistoryList";
import { useUserProfile } from "@/hooks/useUserProfile";

const Profile = () => {
  const { userData, searchHistory, isLoading, saveUserData } = useUserProfile();

  if (isLoading) {
    return (
      <AppLayout title="Profile">
        <div className="flex items-center justify-center h-full">
          <p>Loading user data...</p>
        </div>
      </AppLayout>
    );
  }

  if (!userData) {
    return (
      <AppLayout title="Profile">
        <div className="flex items-center justify-center h-full">
          <p>User data not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile">
      <div className="space-y-6 max-w-4xl mx-auto">
        <ProfileCard userData={userData} saveUserData={saveUserData} />
        <SearchHistoryList searchHistory={searchHistory} />
      </div>
    </AppLayout>
  );
};

export default Profile;
