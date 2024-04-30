const { execSync } = require('child_process');
const fs = require("fs");
import { askQuestion, createReadline, getContentType, handleExistingOutputFile, validateFileExtensions } from './metadata_functions';

// Setup readline interface for user input
const rl = createReadline();

/**
 * Adds metadata to a media file.
 */
async function addMetadata() {
  try {
    // Request input and output file paths from user
    const input_file = await askQuestion(rl, "Enter the input file path: ");
    let output_file = await askQuestion(rl, "Enter the output file path: ");

    while (input_file === output_file) {
      console.log("Output file must be different from the input file. Please choose a different file path.");
      output_file = await askQuestion(rl, "Enter the output file path: ");
    }

    output_file = await validateFileExtensions(input_file, output_file);

    /** 
     * Check if output file exists and handle overwrite scenario. 
     * If the file doesn't already exist, just use -n (no)
     */
    let overwrite = "-n"; 
    if (fs.existsSync(output_file)) {
      overwrite = await handleExistingOutputFile(rl);
    }

    // Retrieve and validate content type
    const content_type = await getContentType(rl);

    // Get the name of the show or movie
    const name = await askQuestion(rl, `Enter the ${content_type} name: `);

    // Execute the ffmpeg command
    let metadataCommand = `ffmpeg ${overwrite} -i "${input_file}" -c copy -metadata title="${name}" -metadata genre="${content_type}"`;

    if (content_type === "show") {
      const season = await askQuestion(rl, "Enter the season number: ");
      const episode = await askQuestion(rl, "Enter the episode number: ");

      const extension = input_file.slice(input_file.lastIndexOf('.'));

      // Tested extensions. Can add more.
      const testedExtensions = [".mp4", ".wmv", ".mov", ".mkv"];

      if(testedExtensions.includes(extension)) {
        metadataCommand += ` -metadata comment="S:${season} E:${episode}"`;
      } else {
        console.log("That extension has not been tested yet! If you know what you're doing add it on line 56, or join the discord!");
      }

    }

    metadataCommand += ` "${output_file}"`;
    execSync(metadataCommand);
    console.log("Metadata added successfully.");

  } catch (error) {
    console.error("An error occurred while adding metadata:", error);
  } finally {
    rl.close();
  }
}

addMetadata();
