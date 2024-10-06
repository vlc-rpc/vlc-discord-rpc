import { askQuestion, createReadline, getContentType, handleExistingOutputFile, validateFileExtensions } from './metadata_functions.cjs';
import { execSync } from 'child_process';
import fs from 'fs';

// Setup readline interface for user input
const rl = createReadline();

/**
 * Adds metadata to a media file.
 */
async function addMetadata() {
  try {
    // Request input and output file paths from user
    const input_file = await askQuestion(rl, 'Enter the input file path: ');
    const extension = input_file.slice(input_file.lastIndexOf('.'));

    // Tested extensions. Can add more.
    const testedExtensions = ['.mp4', '.wmv', '.mov', '.mkv'];
    if (testedExtensions.includes(extension)) {
      let output_file = await askQuestion(rl, 'Enter the output file path: ');

      while (input_file === output_file) {
        console.log('Output file must be different from the input file. Please choose a different file path.');
        output_file = await askQuestion(rl, 'Enter the output file path: ');
      }

      output_file = await validateFileExtensions(input_file, output_file);

      const cleaned_input_file = input_file.replaceAll('"', '');
      const cleaned_ouput_file = output_file.replaceAll('"', '');

      /** 
       * Check if output file exists and handle overwrite scenario. 
       * If the file doesn't already exist, just use -n (no)
       */
      let overwrite = '-n'; 
      if (fs.existsSync(cleaned_ouput_file)) {
        overwrite = await handleExistingOutputFile(rl);
      }

      // Retrieve and validate content type
      const content_type = await getContentType(rl);

      // Get the name of the show or movie
      const name = await askQuestion(rl, `Enter the ${content_type} name: `);

      // Execute the ffmpeg command
      let metadataCommand = `ffmpeg ${overwrite} -i "${cleaned_input_file}" -c copy -metadata title="${name}" -metadata genre="${content_type}"`;

      if (content_type === 'show') {
        const season = await askQuestion(rl, 'Enter the season number: ');
        const episode = await askQuestion(rl, 'Enter the episode number: ');

        metadataCommand += ` -metadata comment="S:${season} E:${episode}"`;
      }

      metadataCommand += ` "${cleaned_ouput_file}"`;
      execSync(metadataCommand);
      console.log('Metadata added successfully.');
    } else {
      console.log('That extension has not been tested yet! If you know what you\'re doing add it on line 18 of metadata.js');
      console.log('If you don\'t want to add it yourself join the Discord on the Github or open an Github issue.');
    }
  } catch (error) {
    console.error('An error occurred while adding metadata:', error);
  } finally {
    rl.close();
  }
}

addMetadata();
