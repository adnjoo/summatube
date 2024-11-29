import React from 'react';
import logo from '@assets/img/icon128.png';

export default function Popup(): JSX.Element {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img src={logo} className="h-36 pointer-events-none" alt="logo" />
        <a
          className="text-blue-400"
          href="https://summa.tube"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Summa.tube!
        </a>
      </header>
    </div>
  );
}
