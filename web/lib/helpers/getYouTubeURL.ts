type GetYouTubeURLParams = {
  video_id: string;
  embed?: boolean;
};

/**
 * Generates a YouTube URL based on the provided parameters.
 * @param {GetYouTubeURLParams} params - The parameters to generate the URL.
 * @returns {string} The generated YouTube URL.
 */
export const getYouTubeURL = ({
  video_id,
  embed = false,
}: GetYouTubeURLParams): string =>
  embed
    ? `https://www.youtube.com/embed/${video_id}`
    : `https://www.youtube.com/watch?v=${video_id}`;
