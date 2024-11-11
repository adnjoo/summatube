'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { HistoryCard } from '@/components/HistoryCard';
import { Button } from '@/components/ui';
import { useUser } from '@/lib/hooks/useUser';
import { supabase } from '@/utils/supabase/client';

export default function Page() {
  const user = useUser();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);

  async function fetchHistory() {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Fetch data from summaries and join with videos to get title and video_id
    const { data, error, count } = await supabase
      .from('summaries')
      .select('id, content, created_at, videos (video_id, title)', { count: 'exact' })
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw new Error(error.message);

    if (count) setTotalPages(Math.ceil(count / pageSize));
    return data;
  }

  const {
    data: history,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['history', page],
    queryFn: fetchHistory,
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('summaries').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className='container mx-auto max-w-4xl p-4 sm:py-12'>
      <h2 className='mb-4 text-xl font-semibold'>History</h2>
      <section className='flex flex-col gap-4 sm:p-4'>
        {!user ? (
          <p className='text-gray-500'>
            You must be logged in to view your history.
          </p>
        ) : isLoading ? (
          <div className='flex justify-center'>
            <Loader2 className='animate-spin text-gray-500' />
          </div>
        ) : history && history.length > 0 ? (
          history.map((item) => (
            <HistoryCard
              item={item}
              key={item.id}
              onDelete={() => deleteMutation.mutate(item.id)}
            />
          ))
        ) : (
          <p className='text-gray-500'>No history available.</p>
        )}
      </section>
      {totalPages > 1 && (
        <div className='mt-4 flex justify-center gap-2'>
          <Button onClick={() => setPage(1)} disabled={page === 1}>
            First
          </Button>
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className='px-4 py-2'>{`Page ${page} of ${totalPages}`}</span>
          <Button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
          <Button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}
