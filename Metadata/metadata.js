const { execSync } = require('child_process');
const readline = require('readline');
const fs = require("fs");

// Setup readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask questions and return user input as a promise
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Add custom metadata to a file using ffmpeg
async function addMetadata() {
    try {
        // Request input and output file paths from user
        const input_file = await askQuestion("Enter the input file path: ");
        let output_file = await askQuestion("Enter the output file path: ");

        while (input_file === output_file) {
            console.log("Output file must be different from the input file. Please choose a different file path.");
            output_file = await askQuestion("Enter the output file path: ");
        }

        output_file = await validateFileExtensions(input_file, output_file);


        /** 
         * Check if output file exists and handle overwrite scenario. 
         * If the file doesn't already exist, just use -n (no)
         **/
        let overwrite = "-n"; 
        if (fs.existsSync(output_file)) {
            overwrite = await handleExistingOutputFile();
        }

        // Retrieve and validate content type
        const content_type = await getContentType();

        // Get the name of the show or movie
        const name = await askQuestion(`Enter the ${content_type} name: `);

        // Execute the ffmpeg command
        let metadataCommand = `ffmpeg ${overwrite} -i "${input_file}" -c copy -metadata title="${name}" -metadata genre="${content_type}"`;

        if (content_type === "show") {
            const season = await askQuestion("Enter the season number: ");
            const episode = await askQuestion("Enter the episode number: ");

            const extension = input_file.slice(input_file.lastIndexOf('.'));


            if(extension === ".mkv") {
                metadataCommand += ` -metadata season="${season}" -metadata episode="${episode}"`;
            } else if (extension === ".mp4" || extension === ".wmv") {
                metadataCommand += ` -metadata comment="S:${season} E:${episode}"`;
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

// Get content type from user
async function getContentType() {
    // This is async
    let content_type = await askQuestion("Enter the content type (movie/show): ")

    // Need to wait before using toLowerCase
    content_type = content_type.toLowerCase();

    while (content_type !== "movie" && content_type !== "show") {
        console.log("Invalid option, please enter again.");
        content_type = await askQuestion("Enter the content type (Movie/Show): ");
        content_type = content_type.toLowerCase();
    }

    return content_type;
}

// Handle existing output file
async function handleExistingOutputFile() {
    // This is async
    let overwrite = await askQuestion("That file already exists! Would you like to overwrite it (y/n): ");

    // Need to wait before using toLowerCase
    overwrite = overwrite.toLowerCase();

    // Ensure valid user input
    while (overwrite !== "y" && overwrite !== "n") {
        console.log("Invalid input, please enter 'y' for yes or 'n' for no.");
        overwrite = await askQuestion("Would you like to overwrite it (y/n): ");
        overwrite = overwrite.toLowerCase();
    }

    // Convert user choice to flag
    return overwrite === 'y' ? '-y' : '-n'; 
}

// Make sure the input and output file extensions are the same
async function validateFileExtensions(input_file, output_file) {
    const inputExt = input_file.slice(input_file.lastIndexOf('.'));
    let outputExt = output_file.slice(output_file.lastIndexOf('.'));

    while (inputExt !== outputExt) {
        console.log(`The output file extension must match the input file extension (${inputExt}). Please enter a valid output file path.`);
        output_file = await askQuestion("Enter the output file path: ");
        outputExt = output_file.slice(output_file.lastIndexOf('.'));
    }
    return output_file;
}

addMetadata();
