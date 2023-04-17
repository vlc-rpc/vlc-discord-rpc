// Require modules and configuations
const { spawn } = require("child_process");
const fs = require("fs");
const config = require("./Storage/config.js");

require("./Functions/client.js");

// Function to generate a random password
function randomPass() {
  return Math.random().toString(36).slice(-8);
}

// Generate a password if needed
if (config.vlcConfig.password === "") {
  config.vlcConfig.password = randomPass();
}

// If windows OS and default path cannot be found try other path
if (process.platform == "win32" && !fs.existsSync(config.platformDefaults.win32)) {
  config.platformDefaults.win32 = config.platformDefaults.winalt;
}

// If VLC path is not specified use the default
const startCommand = config.vlcPath || config.platformDefaults[process.platform];
// Start the process
const child = spawn(
  startCommand,
  [
    "--extraintf",
    "http",
    "--http-host",
    config.vlcConfig.address,
    "--http-password",
    config.vlcConfig.password,
    "--http-port",
    config.vlcConfig.port,
  ],
  {
    stdio: "inherit",
  }
);
// When VLC closes
child.on("exit", () => {
  console.log("VLC closed... exiting program.");
  process.exit(0);
});

// If an error occurs
child.on("error", () => {
  console.log(
    "ERROR: A problem occurred while launching VLC. Make sure the path to VLC is correct in the config.js file. Program will exit after 30 seconds."
  );
  setTimeout(process.exit, 30000, 1);
});
