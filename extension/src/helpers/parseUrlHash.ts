/**
 * Helper to parse URL hash.
 */
export function parseUrlHash(url) {
  const hashParts = new URL(url).hash.slice(1).split('&');
  return new Map(
    hashParts.map((part) => {
      const [name, value] = part.split('=');
      return [name, value];
    })
  );
}
