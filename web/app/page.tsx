import { AppConfig } from '@/lib/constants';

export default async function Home() {
  return (
    <main className='flex flex-col py-4 sm:py-12'>
      <h1 className='text-center text-4xl font-bold'>SummaTube</h1>
      <p className='text-center text-lg mt-4 mb-8 text-gray-600'>
        AI-powered YouTube video summaries and transcripts with clickable timestamps
      </p>

      <div className='flex justify-center mb-12'>
        <div className='flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-full border border-gray-200'>
          <div className='flex -space-x-3'>
            <div className='w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold border-2 border-white'>
              A
            </div>
            <div className='w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-semibold border-2 border-white'>
              S
            </div>
            <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-semibold border-2 border-gray-300'>
              M
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center gap-1 mb-1'>
              {[...Array(5)].map((_, i) => (
                <svg key={i} className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
            </div>
            <span className='text-sm font-medium text-gray-700'>Used by 10K+ YouTube Creators</span>
          </div>
        </div>
      </div>

      <div className='mb-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4'>
          <div className='text-center'>
            <img
              src='/screen-20251223.png'
              alt='SummaTube showing transcript sidebar with clickable timestamps'
              className='w-full rounded-lg shadow-lg border hover:shadow-xl transition-shadow'
            />
            <p className='text-sm text-gray-600 mt-3'>Interactive Transcript Sidebar</p>
          </div>
          <div className='text-center'>
            <img
              src='/screen-2-20251223.png'
              alt='SummaTube AI-powered summary feature'
              className='w-full rounded-lg shadow-lg border hover:shadow-xl transition-shadow'
            />
            <p className='text-sm text-gray-600 mt-3'>AI-Powered Video Summaries</p>
          </div>
        </div>
      </div>

      <div className='text-center'>
        <a
          href={AppConfig.CHROME_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className='inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors'
        >
          <svg className='w-5 h-5 mr-2' viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.53 20.75,12C20.75,12.47 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
          Add to Chrome - It's Free!
        </a>
        <p className='text-sm text-gray-500 mt-4 max-w-md mx-auto'>
          Get AI-powered video summaries and transcripts instantly. Works with any YouTube video that has captions.
        </p>
      </div>
    </main>
  );
}
