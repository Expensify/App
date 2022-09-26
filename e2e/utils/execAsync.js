const {exec} = require('node:child_process');
const Logger = require('./logger');

module.exports = command => new Promise((resolve, reject) => {
    Logger.log('Output of command:', command);
    exec(command, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10, // increase max buffer to 10MB, to avoid errors
    }, (error, stdout) => {
        if (error) {
            Logger.log(`failed with error: ${error}`);
            reject(error);
        } else {
            Logger.log(stdout);
            resolve();
        }
    });
});
