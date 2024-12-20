import { useEffect, useState } from 'react';

import { supabase } from '@/helpers/supabase';

export const useCheckSession = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { session } = await chrome.storage.local.get('session');
        // console.log('session', session);
        if (session) {
          const { error } = await supabase.auth.setSession(session);
          if (!error) {
            setIsLoggedIn(true);
            setPfpUrl(session?.user?.user_metadata?.avatar_url)
          } else {
            console.error('Error restoring session:', error.message);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    checkSession();
  }, []);

  return { isLoggedIn, loading, pfpUrl };
};
