import { Loader } from 'lucide-react';
import React from 'react';

interface SummaryTabProps {
  summary: string | null;
  summaryLoading: boolean;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ summary, summaryLoading }) => {
  if (summaryLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader size={48} className='animate-spin text-blue-500' />
      </div>
    );
  }

  return (
    <div id='summary-section' className='mt-4 text-gray-800 dark:text-gray-300'>
      {summary ? <p>{summary}</p> : <p>No summary available.</p>}
    </div>
  );
};

export default SummaryTab;
