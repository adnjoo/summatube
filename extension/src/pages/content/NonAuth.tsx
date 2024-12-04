export const NonAuth = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage(
      { type: 'GREETING', text: 'Hello from the content script!' },
      (response) => {
        console.log('Response received:', response);
      }
    );
  };

  return (
    <div className='flex items-center justify-center'>
      <button
        onClick={handleClick}
        className='rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
      >
        Login with Google
      </button>
    </div>
  );
};
