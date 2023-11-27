const os = require('os');

export function isWindows() {
    return os.platform() === "win32";
}