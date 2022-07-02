// --- Plex Settings ---

// Plex hostname might be an IP address or URL depending on your setup
export const PLEX_HOSTNAME = "192.168.1.100";

// Plex port default is 32400
export const PLEX_PORT = 32400;

// Use https for Plex connection, default is false
export const PLEX_HTTPS = false;

// Plex token, to obtain see: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
export const PLEX_TOKEN = "";

// --- Output Settings ---

// Output mode: text or html
export const OUTPUT_MODE = "text";

// Filename for text output
export const OUTPUT_TEXT_FILENAME = "nowplaying.txt";

// Text to display when no song is playing
export const NO_SONG_TEXT = "Nothing Playing";

// String to add to the end of text output
export const TEXT_SEPARATOR = " | ";

// --- App Settings ---

// Rate to read play queue file, in milliseconds
export const POLLING_RATE = 1000;