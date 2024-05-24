import { directoryExists, extractMovieName, extractShowDetails } from './metadata_functions.cjs';
import { directories } from '../Storage/config.js';
import { execSync } from 'child_process';
import fs from 'fs';

// Tested extensions. Can add more.
const testedExtensions = ['.mp4', '.wmv', '.mov', '.mkv', '.avi'];

/**
 * Adds metadata to media files based on their type ('show' or 'movie').
 * @param {string} inputFile - The path to the media file to which metadata should be added.
 * @param {string} type - The type of media, expected to be either 'show' or 'movie'.
 */
async function addMetadata(inputFile, type) {
  if (inputFile.includes('_meta')) {
    return;
  }

  try {
    const extension = inputFile.slice(inputFile.lastIndexOf('.'));
    if (!testedExtensions.includes(extension)) {return;}

    const outputFile = inputFile.replace(/\.[^/.]+$/, '_meta$&');
    let finalName = 'Unknown';
    let metadataCommand = '';

    if (type === 'show') {
      const { showName, season, episode } = extractShowDetails(inputFile.split('/').pop());
      
      // If showName is two letters with a space in between, remove the space
      finalName = showName.length === 3 && showName[1] === ' ' ? showName.replace(' ', '') : showName;

      console.log('Final show name:', finalName, 'Season:', season, 'Episode:', episode);

      metadataCommand = `ffmpeg -y -loglevel error -i "${inputFile}" -c copy ` +
        `-metadata title="${finalName}" ` +
        `-metadata genre=${type} ` +
        `-metadata comment="S:${season} E:${episode}" "${outputFile}"`;
    } else if (type === 'movie') {
      finalName = extractMovieName(inputFile.split('/').pop());

      console.log('Final movie name:', finalName);

      metadataCommand = `ffmpeg -y -loglevel error -i "${inputFile}" -c copy ` +
        `-metadata title="${finalName}" ` +
        `-metadata genre=${type} "${outputFile}"`;
    }

    if (metadataCommand) {
      execSync(metadataCommand);
      console.log(`Metadata added successfully to ${inputFile}.`);
    }
  } catch (error) {
    console.error('An error occurred while adding metadata:', error);
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
    console.log('WARNING: Show path not found!');
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
    console.log('WARNING: Movie path not found!');
  }
}

/**
 * Checks the existence of directories and processes files accordingly.
 */
async function checkDirectories() {
  try {
    const showsPathExists = await directoryExists(directories.shows);
    const moviesPathExists = await directoryExists(directories.movies);

    if (!showsPathExists && !moviesPathExists) {
      console.log('Shows and Movies directory were both non-existent! Exiting program..');
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