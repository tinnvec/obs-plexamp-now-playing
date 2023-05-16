// --- Plex Settings ---

// Plex hostname might be an IP address or URL depending on your setup
export const PLEX_HOSTNAME = "192.168.1.100";

// Plex port default is 32400
export const PLEX_PORT = 32400;

// Use https for Plex connection, default is false
export const PLEX_HTTPS = false;

// Plex token, to obtain see: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
export const PLEX_TOKEN = "";

// Username to watch for playing tracks
export const WATCH_USERNAME = ""

// --- Output Settings ---

// Output mode: text, html, or image
export const OUTPUT_MODE = "text";

// Text to display when no song is playing
export const NO_SONG_TEXT = "Nothing Playing";

// Filename for text output
export const OUTPUT_TEXT_FILENAME = "nowplaying.txt";

// String to add to the end of text output
export const TEXT_SEPARATOR = " | ";

// Filename for image output
export const OUTPUT_IMAGE_FILENAME = "nowplaying.png";

// --- App Settings ---

// Rate to read play queue, in milliseconds
export const POLLING_RATE = 1000;