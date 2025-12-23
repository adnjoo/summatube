import { AppConfig } from '@/lib/constants';

export default async function Home() {
  return (
    <main className='flex flex-col py-4 sm:py-12'>
      <h1 className='text-center text-4xl font-bold'>SummaTube</h1>
      <p className='text-center text-lg mt-4 mb-8 text-gray-600'>
        AI-powered YouTube video summaries and transcripts with clickable timestamps
      </p>

      <div className='text-center mb-8'>
        <img
          src='/screen.png'
          alt='SummaTube Chrome Extension in action'
          className='max-w-4xl mx-auto rounded-lg shadow-lg border'
        />
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
