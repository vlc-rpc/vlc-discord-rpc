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
  if (input_file.includes("_meta")) {
    return;
  }

  try {
    const extension = input_file.slice(input_file.lastIndexOf('.'));
    const output_file = input_file.substring(0, input_file.lastIndexOf('.')) + "_meta" + input_file.substring(input_file.lastIndexOf('.'));
    let finalName = "Unknown";

    let metadataCommand = '';
    let seasonNumber = 0; // Define seasonNumber variable here

    if (testedExtensions.includes(extension)) {
      if (type === 'show') {
        const parts = input_file.split('.');
        const seasonEpisodePart = parts.find(part => /S\d+E\d+/i.test(part));

        // Find the index where the season and episode part starts
        const indexOfSeasonEpisodePart = parts.indexOf(seasonEpisodePart);
        
        if (seasonEpisodePart && indexOfSeasonEpisodePart > 0) {
          // Extract the show name from the parts before the season and episode part
          const showNameParts = parts.slice(0, indexOfSeasonEpisodePart).filter(part => !/\b\d{4}\b/.test(part)); // Exclude parts containing 4-digit numbers (assumed to be year)

          finalName = showNameParts.join(" ").split("/").pop();

          // Replace underscores, dashes, and dots with spaces in the final name
          finalName = finalName.replace(/[_-]/g, ' ');

          // Extract season number from the seasonEpisodePart
          const matches = seasonEpisodePart.match(/S(\d{1,2})E(\d{1,2})/);
          if (matches && matches.length >= 3) {
            seasonNumber = parseInt(matches[1]);
            const episodeNumber = parseInt(matches[2]);

            metadataCommand = `ffmpeg -y -i "${input_file}" -c copy ` +
              `-metadata title="${finalName}" ` +
              `-metadata genre=${type} ` +
              `-metadata comment="S:${seasonNumber} E:${episodeNumber}" `;
          } else {
            console.log("The show name was not formatted properly! The season and episode number have been set to 0.");
          }
        } else {
          console.log("Season and episode number not found in the filename!");
        }
      } else if (type === 'movie') {
        const splitName = input_file.split(".");
        
        // Find the index where the movie name ends
        let indexOfEndOfMovieName = splitName[0].length;
        // Check for common delimiters or patterns that indicate the end of the movie name
        const delimiters = ["(", "1080p", "720p", "BluRay"];
        for (const delimiter of delimiters) {
          const index = splitName[0].indexOf(delimiter);
          if (index !== -1 && index < indexOfEndOfMovieName) {
            indexOfEndOfMovieName = index;
          }
        }

        // Extract the movie name from the beginning of the filename up to the found index
        finalName = splitName[0].substring(0, indexOfEndOfMovieName).split("/").pop();

        // Replace underscores, dashes, and dots with spaces in the final name
        finalName = finalName.replace(/[_-]/g, ' ');

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
