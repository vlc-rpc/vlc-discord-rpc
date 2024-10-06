const readline = require('readline');
const fs = require('fs');

/**
 * Creates a readline interface for user input.
 * @returns {readline.Interface} A readline interface for user input.
 */
function createReadline() {
  // Setup readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return rl;
} 

/**
 * Prompts the user with a question and returns their input as a promise.
 * @param {readline.Interface} rl - The readline interface.
 * @param {string} query - The question to ask the user.
 * @returns {Promise<string>} A promise that resolves with the user's input.
 */
function askQuestion(rl, query) {
  return new Promise(resolve => {return rl.question(query, resolve);});
}

/**
 * Ensures that the output file extension matches the input file extension.
 * @param {string} input_file - The path to the input file.
 * @param {string} output_file - The path to the output file.
 * @returns {Promise<string>} A promise that resolves with the validated output file path.
 */
async function validateFileExtensions(input_file, output_file) {
  const inputExt = input_file.slice(input_file.lastIndexOf('.'));
  let outputExt = output_file.slice(output_file.lastIndexOf('.'));
    
  while (inputExt !== outputExt) {
    console.log(`The output file extension must match the input file extension (${inputExt}). Please enter a valid output file path.`);
    output_file = await askQuestion('Enter the output file path: ');
    outputExt = output_file.slice(output_file.lastIndexOf('.'));
  }
  return output_file;
}

/**
 * Prompts the user to specify the content type (movie or show) and returns it.
 * @param {readline.Interface} rl - The readline interface.
 * @returns {Promise<string>} A promise that resolves with the content type entered by the user.
 */
async function getContentType(rl) {
  // This is async
  let content_type = await askQuestion(rl, 'Enter the content type (movie/show): ');
    
  // Need to wait before using toLowerCase
  content_type = content_type.toLowerCase();
    
  while (content_type !== 'movie' && content_type !== 'show') {
    console.log('Invalid option, please enter again.');
    content_type = await askQuestion(rl, 'Enter the content type (Movie/Show): ');
    content_type = content_type.toLowerCase();
  }
    
  return content_type;
}

/**
 * Handles the scenario when the output file already exists.
 * @param {readline.Interface} rl - The readline interface.
 * @returns {Promise<string>} A promise that resolves with the overwrite flag ("-y" or "-n").
 */
async function handleExistingOutputFile(rl) {
  // This is async
  let overwrite = await askQuestion(rl, 'That file already exists! Would you like to overwrite it (y/n): ');
    
  // Need to wait before using toLowerCase
  overwrite = overwrite.toLowerCase();
    
  // Ensure valid user input
  while (overwrite !== 'y' && overwrite !== 'n') {
    console.log('Invalid input, please enter \'y\' for yes or \'n\' for no.');
    overwrite = await askQuestion(rl, 'Would you like to overwrite it (y/n): ');
    overwrite = overwrite.toLowerCase();
  }
    
  // Convert user choice to flag
  return overwrite === 'y' ? '-y' : '-n'; 
}

/**
 * Cleans the name by removing extra details like year, resolution, and special characters.
 * @param {string} name - The name to clean.
 * @returns {string} - The cleaned name.
 */
function cleanName(name) {
  const qualityMarkers = [
    '2160p', '1080p', '720p', '480p', '360p', 'BluRay', 'WEBRip', 'BRRip',
    'DVDRip', 'HDRip', 'REPACK', '10bit', 'DUAL-AUDIO', 'KOR-ENG', '6CH', 
    'x265', 'HEVC-PSA'
  ];

  // Remove quality markers
  qualityMarkers.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    name = name.replace(regex, '');
  });

  // Remove extra details like year, resolution, etc.
  name = name.replace(/\d{4}.*$/, '').replace(/[._]/g, ' ');

  // Remove trailing spaces and special characters
  name = name.trim().replace(/[()[\]{}]+$/, '');

  // Remove multiple spaces
  name = name.replace(/\s\s+/g, ' ');

  name = name.replace(/[@#$%^&*(),.":{}|<>-]+$/, '');

  if (name.trim() === '') {
    return 'Unknown';
  }

  name = name.length === 3 && name[1] === ' ' ? name.replace(' ', '') : name;

  return name.trim();
}

/**
 * Extracts the final movie name from a file name.
 * @param {string} fileName - The file name to extract the movie name from.
 * @returns {string} - The final movie name.
 */
function extractMovieName(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  return cleanName(nameWithoutExtension);
}

/**
 * Extracts the final show name, season, episode, and episode title from a file name.
 * @param {string} fileName - The file name to extract the show details from.
 * @returns {object} - The final show name, season, episode, and episode title.
 */
function extractShowDetails(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  const showDetails = nameWithoutExtension.match(/^(.*?)(S\d+E\d+)(.*?)$/i);

  if (!showDetails) {
    return { showName: cleanName(nameWithoutExtension), season: 0, episode: 0, episodeTitle: 'Unknown' };
  }

  const [, showNamePart, seasonEpisodePart, episodeTitlePart] = showDetails;
  const seasonEpisodeMatch = seasonEpisodePart.match(/S(\d+)E(\d+)/i);
  
  const seasonNumber = seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[1], 10) : 0;
  const episodeNumber = seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[2], 10) : 0;

  const showName = cleanName(showNamePart);
  const episodeTitle = cleanName(episodeTitlePart);

  return { showName, season: seasonNumber, episode: episodeNumber, episodeTitle };
}

/**
 * Checks if a directory exists.
 * @param {string} directoryPath - The path to the directory.
 * @returns {Promise<boolean>} - True if the directory exists, otherwise false.
 */
const directoryExists = async (directoryPath) => {
  try {
    await fs.promises.access(directoryPath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  createReadline,
  validateFileExtensions,
  askQuestion, 
  getContentType, 
  handleExistingOutputFile, 
  cleanName, 
  extractMovieName, 
  extractShowDetails,
  directoryExists
};