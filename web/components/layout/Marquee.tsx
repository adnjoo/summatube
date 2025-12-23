import React from 'react';

interface VideoGridProps {
  children: React.ReactNode;
}

export function VideoGrid({ children }: VideoGridProps) {
  // Convert children to array and take only first 8
  const childrenArray = React.Children.toArray(children);
  const displayChildren = childrenArray.slice(0, 8);

  return (
    <div className='mb-8'>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8'>
        {displayChildren}
      </div>
    </div>
  );
}

// Keep the old Marquee for backward compatibility if needed
export function Marquee({ children }) {
  return (
    <div className='marquee-container mb-4'>
      <div className='marquee-content gap-12'>
        {children}
        {children} {/* Duplicate the content for infinite scroll effect */}
      </div>
    </div>
  );
}
