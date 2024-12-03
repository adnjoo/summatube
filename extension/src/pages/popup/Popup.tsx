import { useEffect, useState } from 'react';

import { supabase } from '@/helpers/supabase';

export default function Popup(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { session } = await chrome.storage.local.get('session');
      console.log('session', session);
      if (session) {
        const { error } = await supabase.auth.setSession(session);
        if (!error) {
          setIsLoggedIn(true);
        } else {
          console.error('Error restoring session:', error.message);
        }
      }
      setLoading(false); // Ensure loading is stopped
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: chrome.identity.getRedirectURL(),
        },
      });

      if (error) throw error;

      // Open the OAuth URL in a new tab
      await chrome.tabs.create({ url: data.url });
    } catch (error: any) {
      console.error('Login error:', error.message);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear the session from local storage
      await chrome.storage.local.remove('session');

      // Update the state
      setIsLoggedIn(false);
      alert('Successfully logged out.');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className='p-4'>
      {loading ? (
        <p>Loading...</p>
      ) : isLoggedIn ? (
        <>
          <h1 className='text-lg font-bold'>Welcome Back!</h1>
          <button
            onClick={handleLogout}
            className='mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <h1 className='text-lg font-bold'>Login with Google</h1>
          <button
            onClick={handleLogin}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Login
          </button>
        </>
      )}
    </div>
  );
}
