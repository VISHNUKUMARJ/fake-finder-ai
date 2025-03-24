
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthStateChange = (callback: (accessToken: string | null) => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthStateChange = async () => {
      const hash = window.location.hash;
      
      // Handle password recovery flow
      if (hash && hash.includes('type=recovery')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: ''
          });
          
          window.history.replaceState(null, document.title, window.location.pathname);
          callback(accessToken);
        }
      } 
      // Handle email verification flow
      else if (hash && hash.includes('type=signup')) {
        // Clean up the URL
        window.history.replaceState(null, document.title, '/login');
        
        // Redirect to login page
        navigate('/login');
        
        // Return null to the callback since we don't need to open any modals for email verification
        callback(null);
      } else {
        callback(null);
      }
    };

    handleAuthStateChange();
  }, [callback, navigate]);
};
