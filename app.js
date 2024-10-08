// Require modules and configuations
import './Functions/Discord_Client.js';
import { detached, platformDefaults, vlcConfig, vlcPath } from './Storage/config.js';
import Client from './Functions/VLC_Client.js';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

// Set process & terminal title to easily distinguish this process from other node processes.
// Windows combines both, Linux sets them separately and allows only short process names.
if (process.platform === 'win32') {
  process.title = 'VLC Discord RPC';
} else {
  process.title = 'vlcrpc';
  process.stdout.write(`${String.fromCharCode(27)}]0;VLC Discord RPC${String.fromCharCode(7)}`);
}

/**
 * Generates a random password.
 * @returns {string} A randomly generated password.
 */
function randomPass() {
  return Math.random().toString(36).slice(-8);
}

let { password } = vlcConfig;

// Generate a password if needed
if (vlcConfig.password === '') {
  password = randomPass();
}

const url = `${vlcConfig.address  }:${  vlcConfig.port}`;
const VLCClient = new Client(url, password);

// If windows OS and default path cannot be found try other path
if (process.platform === 'win32' && !existsSync(platformDefaults.win32)) {
  platformDefaults.win32 = platformDefaults.winalt;
}

// If VLC path is not specified use the default
const startCommand = vlcPath || platformDefaults[process.platform];

if (!detached) {
  // Start the process
  const child = spawn(
    startCommand,
    [
      '--extraintf',
      'http',
      '--http-host',
      vlcConfig.address,
      '--http-password',
      password,
      '--http-port',
      vlcConfig.port
    ],
    {
      stdio: 'inherit'
    }
  );
  // When VLC closes
  child.on('exit', () => {
    console.log('VLC closed... exiting program.');
    process.exit(0);
  });

  // If an error occurs
  child.on('error', () => {
    console.log(
      'ERROR: A problem occurred while launching VLC. Make sure the path to VLC is correct in the config.js file. Program will exit after 30 seconds.'
    );
    setTimeout(process.exit, 30000, 1);
  });
}

export { VLCClient };
