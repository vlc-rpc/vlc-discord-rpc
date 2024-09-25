// Require modules and configuations
import "./Functions/Discord_Client.js";
import { detached, platformDefaults, vlcConfig, vlcPath } from "./Storage/config.js";
import { existsSync } from "fs";
import { spawn } from "child_process";

/**
 * Generates a random password.
 * @returns {string} A randomly generated password.
 */
function randomPass() {
  return Math.random().toString(36).slice(-8);
}

// Generate a password if needed
if (vlcConfig.password === "") {
  vlcConfig.password = randomPass();
}

// If windows OS and default path cannot be found try other path
if (process.platform === "win32" && !existsSync(platformDefaults.win32)) {
  platformDefaults.win32 = platformDefaults.winalt;
}

// If VLC path is not specified use the default
const startCommand = vlcPath || platformDefaults[process.platform];

if(!detached) {
// Start the process
  const child = spawn(
    startCommand,
    [
      "--extraintf",
      "http",
      "--http-host",
      vlcConfig.address,
      "--http-password",
      vlcConfig.password,
      "--http-port",
      vlcConfig.port
    ],
    {
      stdio: "inherit"
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
}