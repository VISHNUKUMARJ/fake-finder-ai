
// History manager for tracking user detection activities
import { supabase } from "@/integrations/supabase/client";

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

export const addToSearchHistory = async (item: Omit<SearchHistoryItem, 'id' | 'date'>) => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Insert history item into Supabase
    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        type: item.type,
        filename: item.filename,
        text_snippet: item.textSnippet,
        result: item.result,
        confidence_score: item.confidenceScore
      });
    
    if (error) {
      console.error("Error adding to search history:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding to search history:", error);
    return false;
  }
};

export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // Get history items from Supabase
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error getting search history:", error);
      return [];
    }
    
    // Transform to match the SearchHistoryItem interface with proper type casting
    return data.map(item => ({
      id: item.id,
      type: item.type as DetectionType, // Cast the string type to DetectionType
      filename: item.filename,
      textSnippet: item.text_snippet,
      result: item.result,
      confidenceScore: item.confidence_score,
      date: item.date
    }));
  } catch (error) {
    console.error("Error getting search history:", error);
    return [];
  }
};

export const deleteHistoryItem = async (itemId: string): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Delete history item from Supabase
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error deleting history item:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting history item:", error);
    return false;
  }
};

export const clearAllHistory = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Delete all history items for the current user from Supabase
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error clearing history:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing history:", error);
    return false;
  }
};
