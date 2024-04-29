const readline = require('readline');
function createReadline() {
  // Setup readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return rl;
} 

// Ask questions and return user input as a promise
function askQuestion(rl, query) {
  return new Promise(resolve => {return rl.question(query, resolve);});
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

// Get content type from user
async function getContentType(rl) {
  // This is async
  let content_type = await askQuestion(rl, "Enter the content type (movie/show): ");
    
  // Need to wait before using toLowerCase
  content_type = content_type.toLowerCase();
    
  while (content_type !== "movie" && content_type !== "show") {
    console.log("Invalid option, please enter again.");
    content_type = await askQuestion(rl, "Enter the content type (Movie/Show): ");
    content_type = content_type.toLowerCase();
  }
    
  return content_type;
}

// Handle existing output file
async function handleExistingOutputFile(rl) {
  // This is async
  let overwrite = await askQuestion(rl, "That file already exists! Would you like to overwrite it (y/n): ");
    
  // Need to wait before using toLowerCase
  overwrite = overwrite.toLowerCase();
    
  // Ensure valid user input
  while (overwrite !== "y" && overwrite !== "n") {
    console.log("Invalid input, please enter 'y' for yes or 'n' for no.");
    overwrite = await askQuestion(rl, "Would you like to overwrite it (y/n): ");
    overwrite = overwrite.toLowerCase();
  }
    
  // Convert user choice to flag
  return overwrite === 'y' ? '-y' : '-n'; 
}

export {createReadline, validateFileExtensions, askQuestion, getContentType, handleExistingOutputFile};