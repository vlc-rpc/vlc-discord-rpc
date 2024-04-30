const readline = require('readline');
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
    output_file = await askQuestion("Enter the output file path: ");
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

/**
 * Handles the scenario when the output file already exists.
 * @param {readline.Interface} rl - The readline interface.
 * @returns {Promise<string>} A promise that resolves with the overwrite flag ("-y" or "-n").
 */
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