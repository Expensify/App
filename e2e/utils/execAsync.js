const {exec} = require('node:child_process');
const Logger = require('./logger');

module.exports = command => new Promise((resolve, reject) => {
    Logger.log('Output of command:', command);
    exec(command, {
        encoding: 'utf8',
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
