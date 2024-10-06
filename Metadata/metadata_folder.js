const { execSync } = require('child_process');
const fs = require('fs').promises;  
const path = require('path');   
import { askQuestion, createReadline, getContentType, handleExistingOutputFile } from './metadata_functions.cjs';    

const rl = createReadline();

/**
 * Retrieves the list of files in a directory.
 * @param {string} directory - The path to the directory.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of filenames in the directory.
 */
async function directoryFiles(directory) {
  return fs.readdir(directory).catch(err => {
    console.error(`Failed to read directory ${directory}:`, err);
    throw err;
  });
}

/**
 * Adds metadata to media files in a specified directory.
 */
async function addMetadata() {
  try {
    const directory = await askQuestion('Enter the directory to add metadata to: ');
    const files = await directoryFiles(directory);  
    for (const file of files) {
      if (file.includes('meta')) {
        continue;
      }
      const input_file = path.join(directory, file);
      const extension = input_file.slice(input_file.lastIndexOf('.'));

      // Tested extensions. Can add more.
      const testedExtensions = ['.mp4', '.wmv', '.mov', '.mkv', '.avi'];

      if (testedExtensions.includes(extension)) {

        const output_file = `${input_file.substring(0, input_file.lastIndexOf('.'))  }_meta${  input_file.substring(input_file.lastIndexOf('.'))}`;

        console.log(`Writing to ${output_file}`);
    
        /** 
         * Check if output file exists and handle overwrite scenario. 
         * If the file doesn't already exist, just use -n (no)
         */
        let overwrite = '-n'; 
        if (fs.existsSync(output_file)) {
          overwrite = await handleExistingOutputFile();
        }
    
        // Retrieve and validate content type
        const content_type = await getContentType(rl);
    
        // Get the name of the show or movie
        const name = await askQuestion(`Enter the ${content_type} name: `);
    
        // Execute the ffmpeg command
        let metadataCommand = `ffmpeg ${overwrite} -i "${input_file}" -c copy -metadata title="${name}" -metadata genre="${content_type}"`;
    
        if (content_type === 'show') {
          const season = await askQuestion('Enter the season number: ');
          const episode = await askQuestion('Enter the episode number: ');

          metadataCommand += ` -metadata comment="S:${season} E:${episode}"`;
        }
    
        metadataCommand += ` "${output_file}"`;
        execSync(metadataCommand);
        console.log('Metadata added successfully.');
      } else {
        console.log('That extension has not been tested yet! If you know what you\'re doing add it on line 35 of metadata_folder.js');
        console.log('If you don\'t want to add it yourself join the Discord on the Github or open an Github issue.');
      }
    }
  }    catch (error) {
    console.error('An error occurred while adding metadata:', error);
  } finally {
    rl.close();
  }}

addMetadata();