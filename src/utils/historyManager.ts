
// History manager for tracking user detection activities

export type DetectionType = 'image' | 'video' | 'text' | 'audio';

export interface SearchHistoryItem {
  id: string;
  type: DetectionType;
  filename?: string;
  textSnippet?: string;
  result: boolean;
  confidenceScore: number;
  date: string;
}

export const addToSearchHistory = (item: Omit<SearchHistoryItem, 'id' | 'date'>) => {
  try {
    // Get current user email
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    const userEmail = currentUser.email;
    
    if (!userEmail) return false;
    
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userIndex = allUsers.findIndex((user: any) => user.email === userEmail);
    
    if (userIndex === -1) return false;
    
    // Create new history item
    const newItem: SearchHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    
    // Update user's search history
    if (!allUsers[userIndex].searchHistory) {
      allUsers[userIndex].searchHistory = [];
    }
    
    // Add new item at the beginning of the array (most recent first)
    allUsers[userIndex].searchHistory.unshift(newItem);
    
    // Save updated users data
    localStorage.setItem("fakefinder_users", JSON.stringify(allUsers));
    
    return true;
  } catch (error) {
    console.error("Error adding to search history:", error);
    return false;
  }
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    const userEmail = currentUser.email;
    
    if (!userEmail) return [];
    
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const user = allUsers.find((user: any) => user.email === userEmail);
    
    if (!user) return [];
    
    return user.searchHistory || [];
  } catch (error) {
    console.error("Error getting search history:", error);
    return [];
  }
};

export const deleteHistoryItem = (itemId: string): boolean => {
  try {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    const userEmail = currentUser.email;
    
    if (!userEmail) return false;
    
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userIndex = allUsers.findIndex((user: any) => user.email === userEmail);
    
    if (userIndex === -1) return false;
    
    // Check if user has search history
    if (!allUsers[userIndex].searchHistory) return false;
    
    // Filter out the item to delete
    allUsers[userIndex].searchHistory = allUsers[userIndex].searchHistory.filter(
      (item: SearchHistoryItem) => item.id !== itemId
    );
    
    // Save updated users data
    localStorage.setItem("fakefinder_users", JSON.stringify(allUsers));
    
    return true;
  } catch (error) {
    console.error("Error deleting history item:", error);
    return false;
  }
};

export const clearAllHistory = (): boolean => {
  try {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
    const userEmail = currentUser.email;
    
    if (!userEmail) return false;
    
    // Get all users
    const allUsers = JSON.parse(localStorage.getItem("fakefinder_users") || "[]");
    const userIndex = allUsers.findIndex((user: any) => user.email === userEmail);
    
    if (userIndex === -1) return false;
    
    // Clear user's search history
    allUsers[userIndex].searchHistory = [];
    
    // Save updated users data
    localStorage.setItem("fakefinder_users", JSON.stringify(allUsers));
    
    return true;
  } catch (error) {
    console.error("Error clearing history:", error);
    return false;
  }
};
