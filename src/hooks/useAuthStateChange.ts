
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthStateChange = (callback: (accessToken: string | null) => void) => {
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const hash = window.location.hash;
      
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
      } else {
        callback(null);
      }
    };

    handleAuthStateChange();
  }, [callback]);
};
