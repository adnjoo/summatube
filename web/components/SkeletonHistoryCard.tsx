export const SkeletonHistoryCard = () => (
  <div className='flex w-full animate-pulse flex-col rounded-lg border border-gray-100 px-2 py-4 shadow-sm md:flex-row'>
    <div className='flex w-full flex-col md:w-64'>
      <div className='mb-2 h-4 w-3/4 rounded bg-gray-300' />

      <div className='mb-4 h-3 w-1/2 rounded bg-gray-200' />

      <div className='mb-2 h-40 w-full rounded-md bg-gray-300' />
    </div>
    <div className='mt-4 flex gap-4 sm:flex-col md:ml-4 md:mt-0'>
      <div className='h-8 w-16 rounded-md bg-gray-300' />

      <div className='h-8 w-8 rounded-md bg-gray-300' />
    </div>
    <div className='ml-0 mt-4 w-full text-xs md:ml-4 md:mt-0'>
      <div className='mt-2 h-3 w-full rounded bg-gray-300' />
      <div className='mt-2 h-3 w-2/3 rounded bg-gray-300' />
    </div>
  </div>
);
