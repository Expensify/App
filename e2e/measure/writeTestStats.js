/* eslint-disable @lwc/lwc/no-async-await */
const fs = require('fs/promises');
const {existsSync} = require('fs');

const {
    OUTPUT_FILE_CURRENT,
    OUTPUT_DIR,
} = require('../config');

/**
 * @param {Object} stats
 * @param {string} stats.name - The name for the test, used in outputs.
 * @param {number} stats.mean - The average time for the test to run.
 * @param {number} stats.stdev - The standard deviation of the test.
 * @param {number} stats.entries - The data points
 * @param {number} stats.runs - The number of times the test was run.
 */
module.exports = async (stats) => {
    if (!stats.name || !stats.mean || !stats.stdev || !stats.entries || !stats.runs) {
        throw new Error('Invalid stats object');
    }

    if (!existsSync(OUTPUT_DIR)) {
        await fs.mkdir(OUTPUT_DIR);
    }
    if (!existsSync(OUTPUT_FILE_CURRENT)) {
        await fs.writeFile(OUTPUT_FILE_CURRENT, '[]');
    }

    try {
        const content = JSON.parse(await fs.readFile(OUTPUT_FILE_CURRENT, 'utf8'));
        const line = `${JSON.stringify(content.concat([stats]))}\n`;
        await fs.writeFile(OUTPUT_FILE_CURRENT, line);
    } catch (error) {
        console.error(`Error writing ${OUTPUT_FILE_CURRENT}`, error);
        throw error;
    }
};
