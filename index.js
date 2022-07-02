import { readFileSync, writeFileSync } from "fs";
import PlexAPI from "plex-api";
import { stdout } from "process";

import { PLEX_HOSTNAME, PLEX_PORT, PLEX_HTTPS, PLEX_TOKEN, POLLING_RATE, OUTPUT_TEXT_FILENAME, TEXT_SEPARATOR, OUTPUT_MODE, NO_SONG_TEXT } from "./config/settings.js";

const baseUrl = `http${PLEX_HTTPS ? "s": ""}://${PLEX_HOSTNAME}:${PLEX_PORT}`;
const client = new PlexAPI({ hostname: PLEX_HOSTNAME, port: PLEX_PORT, https: PLEX_HTTPS, token: PLEX_TOKEN});

const blankThumb = readFileSync("./assets/blank_thumbnail.png");
const base64Image = new Buffer.from(blankThumb).toString("base64");
const blankThumbUri = `data:image/jpeg;base64,${base64Image}`;

console.log(`Monitoring Plex server at ${baseUrl}`);

setInterval(() => {
  client.query("/status/sessions")
    .then(handleNowPlaying, handleQueryError);
}, POLLING_RATE);

function handleNowPlaying(plexSession) {
  if (plexSession === undefined) {
    updateLog("ERROR: Can't find Plex session");
    return;
  }

  const sessionMediaContainer = plexSession.MediaContainer;
  
  if (sessionMediaContainer === undefined) {
    updateLog("ERROR: Can't find Plex session MediaContainer");
    return;
  }

  const sessionMetadata = sessionMediaContainer.Metadata;

  if (sessionMediaContainer.size !== 0 && sessionMetadata === undefined) {
    updateLog("ERROR: Can't find MediaContainer Metadata");
    return;
  }

  let artist = "";
  let album = "";
  let title = "";
  let plexThumb = "";

  if (sessionMediaContainer.size !== 0) {
    const currentSong = sessionMetadata[0];

    artist = currentSong.grandparentTitle;
    album = currentSong.parentTitle;
    title = currentSong.title;
    plexThumb = currentSong.thumb;
  }

  let outputFile;
  let content;
  let logOutput;

  if (OUTPUT_MODE === "text") {
    outputFile = `./output/text/${OUTPUT_TEXT_FILENAME}`;
    
    if (sessionMediaContainer.size === 0) {
      content = NO_SONG_TEXT;
    } else {
      content = `${artist} - ${title}`;
    }

    logOutput = content;
    content += TEXT_SEPARATOR;
  } else {
    outputFile = "./output/html/index.html";

    let thumbUrl;

    if (sessionMediaContainer.size === 0) {
      thumbUrl = blankThumbUri;
      logOutput = NO_SONG_TEXT;
      title = NO_SONG_TEXT;
    } else {
      thumbUrl = `${baseUrl}${plexThumb}?X-Plex-Token=${PLEX_TOKEN}`;
      logOutput = `${artist} - ${title}`;
    }

    const refreshRate = Math.round(POLLING_RATE / 1000);
    const template = readFileSync("./assets/output-template.html").toString();
    
    content = template.replace("{{refreshRate}}", refreshRate)
      .replace("{{thumbUrl}}", thumbUrl)
      .replace("{{title}}", title)
      .replace("{{artist}}", artist)
      .replace("{{album}}", album);
  }

  writeFileSync(outputFile, content);
  updateLog(logOutput);
}

function handleQueryError(error) {
  updateLog(error);
}

// Rewrites final line of stdout
function updateLog(text) {
  stdout.clearLine(0);
  stdout.cursorTo(0);
  stdout.write(text);
}