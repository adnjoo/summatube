'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPro, setIsPro] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setFullName(user.user_metadata.full_name || '');
        setEmail(user.email || '');
        setAvatarUrl(user.user_metadata.avatar_url || '');

        // Fetch additional user profile data from the 'users' table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('pro')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error.message);
        } else {
          setIsPro(userProfile.pro);
        }
      } else {
        router.replace('/login');
      }
    };

    fetchUser();
  }, [supabase, router]);

  const handleUpdateProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      console.error('Error updating user:', error.message);
    } else {
      alert('Profile updated successfully!');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className='flex flex-col items-center py-16'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center'>User Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-center'>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt='User Avatar'
                  className='h-16 w-16 rounded-full'
                />
              ) : (
                <div className='h-16 w-16 rounded-full bg-gray-300' />
              )}
            </div>
            <div>
              <Label htmlFor='full_name'>Full Name</Label>
              <Input
                id='full_name'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='mt-1'
              />
            </div>
            <div>
              <Label>Email</Label>
              <p className='mt-1'>{email}</p>
            </div>
            <div>
              <Label>Subscription Status</Label>
              <p className='mt-1'>{isPro ? 'Pro User' : 'Free User'}</p>
            </div>
            <Button onClick={handleUpdateProfile} className='w-full'>
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
