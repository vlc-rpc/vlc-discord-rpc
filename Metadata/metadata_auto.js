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
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  return cleanName(nameWithoutExtension);
}

/**
 * Cleans the name by removing extra details like year, resolution, and special characters.
 * @param {string} name - The name to clean.
 * @returns {string} - The cleaned name.
 */
function cleanName(name) {
  const qualityMarkers = ["2160p", "1080p", "720p", "480p", "360p", "BluRay", "WEBRip", "BRRip", "DVDRip", "HDRip", "REPACK", "10bit"];
  
  // Remove quality markers
  qualityMarkers.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    name = name.replace(regex, '');
  });

  // Remove extra details like year, resolution, etc.
  name = name.replace(/\d{4}.*$/, '').replace(/[._]/g, ' ');

  // Remove trailing spaces and special characters
  name = name.trim().replace(/[\(\[]$/, '');

  // Remove multiple spaces
  name = name.replace(/\s\s+/g, ' ');

  return name;
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
        const fileName = input_file.split("/").pop(); // Extracting only the file name from the full path
        const seasonEpisodeMatch = fileName.match(/S(\d+)E(\d+)/i);

        if (seasonEpisodeMatch && seasonEpisodeMatch.length >= 3) {
          seasonNumber = parseInt(seasonEpisodeMatch[1]);
          episodeNumber = parseInt(seasonEpisodeMatch[2]);

          // Remove season and episode part from the name
          const nameWithoutSeasonEpisode = fileName.replace(seasonEpisodeMatch[0], '').replace(/\.[^/.]+$/, '');

          // Clean the show name
          finalName = cleanName(nameWithoutSeasonEpisode);

          console.log("Final show name:", finalName, "Season:", seasonNumber, "Episode:", episodeNumber);

          metadataCommand = `ffmpeg -y -loglevel error -i "${input_file}" -c copy ` +
            `-metadata title="${finalName}" ` +
            `-metadata genre=${type} ` +
            `-metadata comment="S:${seasonNumber} E:${episodeNumber}" `;
        } else {
          console.log("Season and episode number not found in the filename!");
        }
      } else if (type === 'movie') {
        const fileName = input_file.split("/").pop(); // Extracting only the file name from the full path
        finalName = extractMovieName(fileName);

        console.log("Final movie name:", finalName);

        metadataCommand = `ffmpeg -y -loglevel error -i "${input_file}" -c copy ` +
          `-metadata title="${finalName}" ` +
          `-metadata genre=${type} `;
      }

      if (metadataCommand) {
        metadataCommand += `"${output_file}"`;
        execSync(metadataCommand);
        console.log(`Metadata added successfully to ${input_file}.`);
      }
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
