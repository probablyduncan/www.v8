const LOG_VERBOSE: boolean = true;
export default function log(...args: any[]) {
    if (LOG_VERBOSE) {
        console.log('\x1b[33m', "IMAGE_INTAKE >>", "\x1b[0m", ...args);
    }
}