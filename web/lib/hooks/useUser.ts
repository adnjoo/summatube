import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/utils/supabase/client';

/**
 * Custom React hook to retrieve the current authenticated user from Supabase.
 *
 * This hook uses `react-query` to manage the user's data and fetch the user object
 * from Supabase's authentication service. The user data is cached indefinitely (never
 * goes stale or garbage collected) to avoid re-fetching unless manually invalidated.
 *
 * @returns {User | undefined} - The current authenticated user object, or `undefined` if no user is logged in.
 *
 * @throws {Error} - Throws an error if there is an issue fetching the user from Supabase.
 */
export function useUser(): User | undefined {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      return data?.user || null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return user;
}
