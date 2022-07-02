import { readFileSync, writeFileSync } from "fs";
import { stdout } from "process";

import { PLAY_QUEUE_LOCATION, OUTPUT_TEXT_FILENAME, TEXT_SEPARATOR, POLLING_RATE } from "./config/settings.js";

const queueFile = `${PLAY_QUEUE_LOCATION}\\PlayQueue.json`;
const outputTextFile = `./output/text/${OUTPUT_TEXT_FILENAME}`;

console.log(`Watching ${queueFile}`);

setInterval(() => {
  try {
    const fileContents = JSON.parse(readFileSync(queueFile));
    const playQueue = fileContents["data"]["MediaContainer"];

    const currentSongID = playQueue["playQueueSelectedItemID"];
    const index = playQueue["Metadata"].findIndex(_ => _["playQueueItemID"] === currentSongID);
    const currentSong = playQueue["Metadata"][index];
    
    const artist = currentSong["grandparentTitle"];
    const title = currentSong["title"];
    
    updateLog(`Now Playing: ${artist} - ${title}`);
    const content = `${artist} - ${title}${TEXT_SEPARATOR}`;
    
    writeFileSync(outputTextFile, content);
  } catch (error) {
    console.log(error);
  }
}, POLLING_RATE);

// Rewrites final line of stdout
function updateLog(text) {
  stdout.clearLine(0);
  stdout.cursorTo(0);
  stdout.write(text);
}