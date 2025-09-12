import * as core from '@actions/core';
import type {CompressionSummary} from '@scripts/compressSvg';
import compressSvg from '@scripts/compressSvg';

function run() {
    try {
        const summary: CompressionSummary = compressSvg('github');

        if (summary.totalSavings > 0) {
            // Files are not compressed. Run`npm run compress-svg` locally and check results on all platforms.
            throw new Error(`SVG ${summary.totalFilesCompressed} file(s) were not compressed. Run 'npm run compress-svg' locally and check results on all platforms.`);
        }

        // Files are compressed. Exit with success.
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error);
            return;
        }
        core.setFailed('An unknown error occurred.');
    }
}

if (require.main === module) {
    run();
}

export default run;
