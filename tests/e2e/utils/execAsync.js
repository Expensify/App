const {exec} = require('node:child_process');
const Logger = require('./logger');

/**
 * Executes a command none-blocking by wrapping it in a promise.
 * In addition to the promise it returns an abort function.
 * @param {string} command
 * @returns {Promise<void>}
 */
module.exports = (command) => {
    let process;
    const promise = new Promise((resolve, reject) => {
        Logger.log(`\nRunning command:`);
        Logger.important(command);

        process = exec(
            command,
            {
                encoding: 'utf8',
                maxBuffer: 1024 * 1024 * 10, // Increase max buffer to 10MB, to avoid errors
            },
            (error, stdout) => {
                if (error) {
                    if (error && error.killed) {
                        resolve();
                    } else {
                        Logger.error(`failed with error: ${error}`);
                        reject(error);
                    }
                } else {
                    Logger.note(stdout);
                    resolve(stdout);
                }
            },
        );
    });

    promise.abort = () => {
        process.kill('SIGINT');
    };

    return promise;
};
