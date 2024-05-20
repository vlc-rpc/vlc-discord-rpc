import { directories } from '../Storage/config.js';
import { execSync } from 'child_process';
import fs from 'fs';

// Tested extensions. Can add more.
const testedExtensions = [".mp4", ".wmv", ".mov", ".mkv", ".avi"];

/**
 * Extracts the final movie name from a file name.
 * @param {string} fileName - The file name to extract the movie name from.
 * @returns {string} The final movie name.
 */
function extractMovieName(fileName) {
  // Remove extension
  const indexOfExtension = fileName.lastIndexOf(".");
  const nameWithoutExtension = fileName.substring(0, indexOfExtension);

  // Remove extra details like year, resolution, etc.
  const cleanedName = nameWithoutExtension.replace(/\d{4}.*$/, '').replace(/[\._]/g, ' ');

  // Trim any trailing spaces or special characters
  return cleanedName.trim().replace(/[\(\[]$/, '');
}

const directoryExists = async (directoryPath) => {
  try {
    await fs.promises.access(directoryPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Removes common quality markers from the name.
 * @param {string} name - The name to clean.
 * @returns {string} - The cleaned name.
 */
const removeQualityMarkers = (name) => {
  const qualityMarkers = ["2160p", "1080p", "720p", "480p", "BluRay", "WEBRip", "BRRip", "DVDRip", "HDRip"];
  qualityMarkers.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    name = name.replace(regex, '');
  });
  return name.trim();
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
    let seasonNumber = 0;
    let episodeNumber = 0;

    if (testedExtensions.includes(extension)) {
      if (type === 'show') {
        const parts = input_file.split('.');
        const seasonEpisodePart = parts.find(part => /S\d+E\d+/i.test(part));

        // Find the index where the season and episode part starts
        const indexOfSeasonEpisodePart = parts.indexOf(seasonEpisodePart);

        if (seasonEpisodePart && indexOfSeasonEpisodePart > 0) {
          // Extract the show name from the parts before the season and episode part
          // Exclude parts containing 4-digit numbers (assumed to be year)
          const showNameParts = parts.slice(0, indexOfSeasonEpisodePart).filter(part => !/\b\d{4}\b/.test(part));

          finalName = showNameParts.join(" ").split("/").pop();

          // Replace underscores, dashes, and dots with spaces in the final name
          finalName = finalName.replace(/[_-]/g, ' ');
          finalName = removeQualityMarkers(finalName);

          // Extract season number and episode number from the seasonEpisodePart
          const matches = seasonEpisodePart.match(/S(\d{1,2})E(\d{1,2})/);
          if (matches && matches.length >= 3) {
            seasonNumber = parseInt(matches[1]);
            episodeNumber = parseInt(matches[2]);

            console.log("Final show name:", finalName, "Season:", seasonNumber, "Episode:", episodeNumber);

            metadataCommand = `ffmpeg -y -loglevel error -i "${input_file}" -c copy ` +
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
        const fileName = input_file.split("/").pop(); // Extracting only the file name from the full path
        finalName = extractMovieName(fileName);
        finalName = removeQualityMarkers(finalName);

        console.log("Final movie name:", finalName);

        metadataCommand = `ffmpeg -y -loglevel error -i "${input_file}" -c copy ` +
          `-metadata title="${finalName}" ` +
          `-metadata genre=${type} `;
      }

      metadataCommand += `"${output_file}"`;
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
      console.log("Shows and Movies directory were both non-existent! Exiting program..");
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
