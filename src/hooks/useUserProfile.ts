
import { useState, useEffect } from "react";
import { SearchHistoryItem, getSearchHistory } from "@/utils/historyManager";

interface UserData {
  name?: string;
  email?: string;
  profileImage?: string;
  [key: string]: any;
}

export const useUserProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data and search history
  useEffect(() => {
    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    
    // Get all users to find the current user's complete data
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userWithHistory = allUsers.find((user: any) => user.email === currentUser.email) || {};
    
    setUserData(userWithHistory);
    setIsLoading(false);
    
    // Load search history using the history manager
    const loadHistory = async () => {
      const history = await getSearchHistory();
      setSearchHistory(history);
    };
    
    loadHistory();
  }, []);

  // Refresh search history when component is focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const refreshHistory = async () => {
          const history = await getSearchHistory();
          setSearchHistory(history);
        };
        refreshHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Function to save user data
  const saveUserData = (updatedData: Partial<UserData>): boolean => {
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
        setUserData(prev => prev ? { ...prev, ...updatedData } : null);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  };

  return {
    userData,
    searchHistory,
    isLoading,
    saveUserData,
    refreshHistory: async () => {
      const history = await getSearchHistory();
      setSearchHistory(history);
    }
  };
};
