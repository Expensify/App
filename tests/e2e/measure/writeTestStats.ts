import fs from 'fs';
import config from '../config';

type Stats = {
    /** The name for the test, used in outputs. */
    name: string;

    /** The average time for the test to run. */
    mean: number;

    /** The standard deviation of the test. */
    stdev: number;

    /** The data points */
    entries: number[];

    /** The number of times the test was run. */
    runs: number;
};

/**
 * Writes the results of `getStats` to the {@link OUTPUT_FILE_CURRENT} file.
 * @param [path] - The path to write to. Defaults to {@link OUTPUT_FILE_CURRENT}.
 */
function writeTestStats(stats: Stats, path = config.OUTPUT_FILE_CURRENT) {
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
}

export default writeTestStats;
