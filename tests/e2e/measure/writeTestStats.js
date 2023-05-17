const fs = require('fs');

const {OUTPUT_FILE_CURRENT} = require('../config');

/**
 * Writes the results of `getStats` to the {@link OUTPUT_FILE_CURRENT} file.
 *
 * @param {Object} stats
 * @param {string} stats.name - The name for the test, used in outputs.
 * @param {number} stats.mean - The average time for the test to run.
 * @param {number} stats.stdev - The standard deviation of the test.
 * @param {number} stats.entries - The data points
 * @param {number} stats.runs - The number of times the test was run.
 * @param {string} [path] - The path to write to. Defaults to {@link OUTPUT_FILE_CURRENT}.
 */
module.exports = (stats, path = OUTPUT_FILE_CURRENT) => {
    if (!stats.name || stats.mean == null || stats.stdev == null || !stats.entries || !stats.runs) {
        throw new Error(`Invalid stats object:\n${JSON.stringify(stats, null, 2)}\n\n`);
    }

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '[]');
    }

    try {
        const content = JSON.parse(fs.readFileSync(path, 'utf8'));
        const line = `${JSON.stringify(content.concat([stats]))}\n`;
        fs.writeFileSync(path, line);
    } catch (error) {
        console.error(`Error writing ${path}`, error);
        throw error;
    }
};
