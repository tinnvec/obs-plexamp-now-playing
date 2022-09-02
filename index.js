import { readFileSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import nodeHtmlToImage from "node-html-to-image";
import { dirname } from 'path';
import PlexAPI from "plex-api";
import readline from "readline";
import { fileURLToPath } from 'url';
import { PLEX_HOSTNAME, PLEX_PORT, PLEX_HTTPS, PLEX_TOKEN, POLLING_RATE, OUTPUT_TEXT_FILENAME, TEXT_SEPARATOR, OUTPUT_MODE, NO_SONG_TEXT, OUTPUT_IMAGE_FILENAME } from "./config/settings.js";

const CWD = dirname(fileURLToPath(import.meta.url));
const BASE_URL = `http${PLEX_HTTPS ? "s": ""}://${PLEX_HOSTNAME}:${PLEX_PORT}`;

const blankThumb = readFileSync(`${CWD}/assets/blank_thumbnail.png`);
const base64Image = new Buffer.from(blankThumb).toString("base64");
const blankThumbUri = `data:image/jpeg;base64,${base64Image}`;

const client = new PlexAPI({ hostname: PLEX_HOSTNAME, port: PLEX_PORT, https: PLEX_HTTPS, token: PLEX_TOKEN});

console.log(`Monitoring Plex server at ${BASE_URL}`);

setInterval(() => {
    client.query("/status/sessions")
      .then(handleNowPlaying, handleQueryError);
}, POLLING_RATE);

async function handleNowPlaying(plexSession) {
  if (plexSession === undefined) {
    console.log("\nERROR: Can't find Plex session");
    return;
  }

  const sessionMediaContainer = plexSession.MediaContainer;
  
  if (sessionMediaContainer === undefined) {
    console.log("\nERROR: Can't find Plex session MediaContainer");
    return;
  }

  const sessionMetadata = sessionMediaContainer.Metadata;

  if (sessionMediaContainer.size !== 0 && sessionMetadata === undefined) {
    console.log("\nERROR: Can't find MediaContainer Metadata");
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
    outputFile = `${CWD}/output/text/${OUTPUT_TEXT_FILENAME}`;
    
    if (sessionMediaContainer.size === 0) {
      content = NO_SONG_TEXT;
    } else {
      content = `${artist} - ${title}`;
    }

    logOutput = content;
    content += TEXT_SEPARATOR;
  } else {
    outputFile = `${CWD}/output/html/index.html`;

    let thumbUrl;

    if (sessionMediaContainer.size === 0) {
      thumbUrl = blankThumbUri;
      logOutput = NO_SONG_TEXT;
      title = NO_SONG_TEXT;
    } else {
      if (plexThumb === undefined) {
        thumbUrl = blankThumbUri;
      } else {
        thumbUrl = `${BASE_URL}${plexThumb}?X-Plex-Token=${PLEX_TOKEN}`;
        const thumbExists = await imageExists(thumbUrl);

        if (!thumbExists) {
          thumbUrl = blankThumbUri;
        }
      }

      logOutput = `${artist} - ${title}`;
    }

    const refreshRate = Math.round(POLLING_RATE / 1000);
    const template = readFileSync(`${CWD}/assets/output-template.html`).toString();
    
    content = template.replace("{{refreshRate}}", refreshRate)
      .replace("{{thumbUrl}}", thumbUrl)
      .replace("{{title}}", title)
      .replace("{{artist}}", artist)
      .replace("{{album}}", album);
  }

  if (OUTPUT_MODE === "image") {
      nodeHtmlToImage({
        output: `${CWD}/output/image/${OUTPUT_IMAGE_FILENAME}`,
        transparent: true,
        html: content,
        waitUntil: "domcontentloaded"
      });
  } else {
    writeFileSync(outputFile, content);
  }

  updateLog(logOutput);
}

function handleQueryError(error) {
  console.log(`\n${error}`);
}

async function imageExists(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  // Plex still responds with a 200 status even if the image can't be found.
  // The blob size is 150 when coming back blank, actual images are larger
  return blob.size !== 150;
}

// Rewrites final line of stdout
function updateLog(text) {
  readline.clearLine(process.stdout)
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(text);
}