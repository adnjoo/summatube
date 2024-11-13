export const isValidYouTubeUrl = (url: string): boolean => {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const isYouTubeDomain =
      hostname === 'www.youtube.com' || hostname === 'youtube.com';
    const isYouTubeBeDomain = hostname === 'youtu.be';
    const hasValidPath = isYouTubeDomain
      ? pathname === '/watch'
      : isYouTubeBeDomain
        ? pathname.length > 1
        : false;
    const hasVideoParam = isYouTubeDomain ? searchParams.has('v') : true; // youtu.be URLs always have a video ID in the path

    return hasValidPath && hasVideoParam;
  } catch (error) {
    return false;
  }
};
