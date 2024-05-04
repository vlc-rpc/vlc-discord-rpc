import { directories } from '../Storage/config.js';
import { execSync } from 'child_process';
import fs from 'fs';
// Tested extensions. Can add more.
const testedExtensions = [".mp4", ".wmv", ".mov", ".mkv", ".avi"];

/**
 * Shows are expected to have file names in the format of: showName_S#E#.extension. Any spaces in the show name should be underscores.
 */

/**
 * Movies are expected to be named the movie name. Any spaces should be underscores.
 */

const directoryExists = async (directoryPath) => {
  try {
    await fs.promises.access(directoryPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Adds metadata to media files based on their type ('show' or 'movie').
 * @param {string} input_file - The path to the media file to which metadata should be added.
 * @param {string} type - The type of media, expected to be either 'show' or 'movie'.
 */
async function addMetadata(input_file, type) {
  if(input_file.includes("_meta")) {
    return;
  }

  try {
    const extension = input_file.slice(input_file.lastIndexOf('.'));

    if(testedExtensions.includes(extension)) {
      const output_file = input_file.substring(0, input_file.lastIndexOf('.')) + "_meta" + input_file.substring(input_file.lastIndexOf('.'));
      let finalName = "Unknown";

      let metadataCommand = '';

      if(type === 'show') {
        const parts = input_file.split('_');
        finalName = parts.slice(0, parts.length - 1).join(" ").split("/").pop();

        metadataCommand = `ffmpeg -y -i "${input_file}" -c copy ` +
        `-metadata title="${finalName}" ` +
        `-metadata genre=${type} `;

        const [lastPart] = parts.slice(-1)[0].split(".");
        const indexOfS = lastPart.indexOf('S');
        const indexOfE = lastPart.indexOf('E');
    
        let seasonNumber = 0;
        let episodeNumber = 0;
    
        // If they exist
        if (indexOfS !== -1 && indexOfE !== -1) {
          seasonNumber = lastPart.slice(indexOfS + 1, indexOfE);
          episodeNumber = lastPart.slice(indexOfE + 1);
        } else {
          console.log("The show name was not formatted properly! The season and episode number have been set to 0.");
        }  

        metadataCommand += `-metadata comment="S:${seasonNumber} E:${episodeNumber}" `;
      } else if (type === 'movie') {
        const splitName = input_file.split("/");
        finalName = splitName[splitName.length - 1].split(".")[0].split("_").join(" ");

        metadataCommand = `ffmpeg -y -i "${input_file}" -c copy ` +
        `-metadata title="${finalName}" ` +
        `-metadata genre=${type} `;
      }

      metadataCommand += `-loglevel error ` +
      `"${output_file}"`;
      execSync(metadataCommand);
      console.log(`Metadata added successfully to ${input_file}.`);    
    }
  } catch (error) {
    console.error("An error occurred while adding metadata:", error);
  }
}

/**
 * Processes files in the directories based on their existence.
 * @param {boolean} showsPathExists - Indicates whether the "Shows" directory exists.
 * @param {boolean} moviesPathExists - Indicates whether the "Movies" directory exists.
 */
async function processFiles(showsPathExists, moviesPathExists) {
  if (showsPathExists) {
    fs.readdir(directories.shows, async (err, files) => {
      if (err) {
        console.error('Error reading Shows directory:', err);
        return;
      }
      for (const file of files) {
        await addMetadata(`${directories.shows}/${file}`, 'show');
      }
    });
  } else {
    console.log("WARNING: Show path not found!");
  }
  if (moviesPathExists) {
    fs.readdir(directories.movies, async (err, files) => {
      if (err) {
        console.error('Error reading Movies directory:', err);
        return;
      }
      for (const file of files) {
        await addMetadata(`${directories.movies}/${file}`, 'movie');
      }
    });
  } else {
    console.log("WARNING: Movie path not found!");
  }
}

/**
 * Checks the existence of directories and processes files accordingly.
 */
async function checkDirectories() {
  try {    
    // Check if the subfolders exist
    const showsPathExists = await directoryExists(directories.shows);
    const moviesPathExists = await directoryExists(directories.movies);    
        
    if (!showsPathExists && !moviesPathExists) {
      console.log("Shows and Movies directory were both non-existant! Exiting program..");
      process.exit(1);
    } else {
      await processFiles(showsPathExists, moviesPathExists);
    }
  } catch (error) {
    console.error('An error occurred while checking directories:', error);
    process.exit(1);
  }
}

await checkDirectories();