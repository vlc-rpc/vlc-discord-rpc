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
 * Adds metadata to a show file.
 * @param {string} input_file - The path to the input show file.
 */
async function handleShow(input_file) {
  if(input_file.includes("_meta")) {
    return;
  }
  try {
    const extension = input_file.slice(input_file.lastIndexOf('.'));

    if(testedExtensions.includes(extension)) {
      const output_file = input_file.substring(0, input_file.lastIndexOf('.')) + "_meta" + input_file.substring(input_file.lastIndexOf('.'));
    
      const parts = input_file.split('_');
      const finalName = parts.slice(0, parts.length - 1).join(" ").split("/").pop();
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

      // Execute the ffmpeg command
      const metadataCommand =
      `ffmpeg -y -i "${input_file}" -c copy ` +
      `-metadata title="${finalName}" ` +
      `-metadata genre="show" ` +
      `-metadata comment="S:${seasonNumber} E:${episodeNumber}" ` +
      `-loglevel error ` +
      `"${output_file}"`;
    
      execSync(metadataCommand);
      console.log(`Metadata added successfully to ${input_file}.`);    
    } else {
      console.log(`${extension} files have not been tested yet! If you know what you're doing add it on line 56, or join the discord!`);
    }
  } catch (error) {
    console.error("An error occurred while adding metadata:", error);
  } 
}

/**
 * Adds metadata to a movie file.
 * @param {string} input_file - The path to the input movie file.
 */
async function handleMovie(input_file) {
  if(input_file.includes("_meta")) {
    return;
  }
  try {
    const extension = input_file.slice(input_file.lastIndexOf('.'));
    
    if(testedExtensions.includes(extension)) {
      const splitName = input_file.split("/");
      const finalName = splitName[splitName.length - 1].split(".")[0].split("_").join(" ");
      const output_file = input_file.substring(0, input_file.lastIndexOf('.')) + "_meta" + input_file.substring(input_file.lastIndexOf('.'));

      // Execute the ffmpeg command
      const metadataCommand =
      `ffmpeg -y -i "${input_file}" -c copy ` +
      `-metadata title="${finalName}" ` +
      `-metadata genre="movie" ` +
      `-loglevel error ` +
      `"${output_file}"`;
    
      execSync(metadataCommand);
      console.log(`Metadata added successfully to ${input_file}.`);    
    } else {
      console.log(`${extension} files have not been tested yet! If you know what you're doing add it on line 56, or join the discord!`);
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
    await fs.readdir(directories.shows, async (err, files) => {
      if (err) {
        console.error('Error reading Shows directory:', err);
        return;
      }
      for (const file of files) {
        await handleShow(`${directories.shows}/${file}`);
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
        await handleMovie(`${directories.movies}/${file}`);
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