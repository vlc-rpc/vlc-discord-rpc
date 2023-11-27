import * as os from "os";

export function isWindows() {
    return os.platform() === "win32";
}