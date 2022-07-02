import { writeFileSync } from "fs";
import PlexAPI from "plex-api";
import { stdout } from "process";

import { PLEX_HOSTNAME, PLEX_PORT, PLEX_HTTPS, PLEX_TOKEN, POLLING_RATE, OUTPUT_TEXT_FILENAME, TEXT_SEPARATOR } from "./config/settings.js";

const baseUrl = `http${PLEX_HTTPS ? "s": ""}://${PLEX_HOSTNAME}:${PLEX_PORT}`;
const client = new PlexAPI({ hostname: PLEX_HOSTNAME, port: PLEX_PORT, https: PLEX_HTTPS, token: PLEX_TOKEN});
const outputTextFile = `./output/text/${OUTPUT_TEXT_FILENAME}`;

console.log(`Monitoring Plex server at ${baseUrl}`);

setInterval(() => {
  client.query("/status/sessions")
    .then(handleNowPlaying, handleQueryError);
}, POLLING_RATE);

function handleNowPlaying(plexSession) {
  if (plexSession === undefined) {
    console.log("ERROR: Can't find Plex session");
    return;
  }

  const sessionMediaContainer = plexSession.MediaContainer;
  
  if (sessionMediaContainer === undefined) {
    console.log("ERROR: Can't find Plex session MediaContainer");
    return;
  }

  if (sessionMediaContainer.size === 0) {
    console.log("Nothing Playing");
    return;
  }

  const sessionMetadata = sessionMediaContainer.Metadata;

  if (sessionMetadata === undefined) {
    console.log("ERROR: Can't find MediaContainer Metadata");
    return;
  }

  const currentSong = sessionMetadata[0];

  const artist = currentSong.grandparentTitle;
  const title = currentSong.title;
  
  updateLog(`Now playing: ${artist} - ${title}`);

  writeFileSync(outputTextFile, `${artist} - ${title}${TEXT_SEPARATOR}`);
}

function handleQueryError(error) {
  console.log(error);
}

// Rewrites final line of stdout
function updateLog(text) {
  stdout.clearLine(0);
  stdout.cursorTo(0);
  stdout.write(text);
}