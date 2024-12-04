import { useEffect, useState } from 'react';

import { supabase } from '@/helpers/supabase';

export default function Options(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { session } = await chrome.storage.local.get('session');
        if (session) {
          const { error } = await supabase.auth.setSession(session);
          if (error) {
            console.error('Error restoring session:', error.message);
          } else {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
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
    } catch (error: any) {
      console.error('Login error:', error.message);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await chrome.storage.local.remove('session');
      setIsLoggedIn(false);
      alert('Successfully logged out.');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className='mx-auto mt-12 max-w-sm rounded-lg bg-white p-6 shadow-md'>
      <img
        src='/icon128.png'
        alt='Extension Icon'
        className='mx-auto h-16 w-16'
      />
      <h1 className='mt-4 text-center text-xl font-bold text-gray-800'>
        Summatube Extension
      </h1>
      <p className='mt-2 text-center text-gray-600'>
        AI-powered YouTube summary at your fingertips.
      </p>
      {loading ? (
        <p className='mt-4 text-center text-gray-600'>Loading...</p>
      ) : isLoggedIn ? (
        <div className='text-center'>
          <h2 className='mt-4 text-lg font-semibold'>Welcome Back!</h2>
          <button
            onClick={handleLogout}
            className='mt-4 rounded bg-red-500 px-6 py-2 text-white transition hover:bg-red-600'
          >
            Logout
          </button>
        </div>
      ) : (
        <div className='text-center'>
          <h2 className='mt-4 text-lg font-semibold'>Login with Google</h2>
          <button
            onClick={handleLogin}
            className='mt-4 rounded bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600'
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
