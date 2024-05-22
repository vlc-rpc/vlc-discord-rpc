import { directories } from '../Storage/config.js';
import { execSync } from 'child_process';
import fs from 'fs';

const testedExtensions = ['.mp4', '.wmv', '.mov', '.mkv', '.avi'];

function cleanName(name) {
  const qualityMarkers = [
    '2160p', '1080p', '720p', '480p', '360p', 'BluRay', 'WEBRip', 'BRRip',
    'DVDRip', 'HDRip', 'REPACK', '10bit', 'DUAL-AUDIO', 'KOR-ENG', '6CH', 
    'x265', 'HEVC-PSA'
  ];

  qualityMarkers.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    name = name.replace(regex, '');
  });

  name = name.replace(/\d{4}.*$/, '').replace(/[._]/g, ' ').trim().replace(/[()[\]{}]+$/, '').replace(/\s\s+/g, ' ');

  return name;
}

function extractMovieName(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  return cleanName(nameWithoutExtension);
}

function extractShowDetails(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  const showDetails = nameWithoutExtension.match(/^(.*?)(S\d+E\d+)(.*?)$/i);

  if (!showDetails) {
    return { showName: cleanName(nameWithoutExtension), season: 0, episode: 0, episodeTitle: '' };
  }

  const [_, showNamePart, seasonEpisodePart, episodeTitlePart] = showDetails;
  const seasonEpisodeMatch = seasonEpisodePart.match(/S(\d+)E(\d+)/i);
  
  const seasonNumber = seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[1], 10) : 0;
  const episodeNumber = seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[2], 10) : 0;

  const showName = cleanName(showNamePart);
  const episodeTitle = cleanName(episodeTitlePart);

  return { showName, season: seasonNumber, episode: episodeNumber, episodeTitle };
}

const directoryExists = async (directoryPath) => {
  try {
    await fs.promises.access(directoryPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

async function addMetadata(inputFile, type) {
  if (inputFile.includes('_meta')) {
    return;
  }

  try {
    const extension = inputFile.slice(inputFile.lastIndexOf('.'));
    if (!testedExtensions.includes(extension)) return;

    const outputFile = inputFile.replace(/\.[^/.]+$/, '_meta$&');
    let finalName = 'Unknown';
    let metadataCommand = '';

    if (type === 'show') {
      const { showName, season, episode } = extractShowDetails(inputFile.split('/').pop());
      
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
