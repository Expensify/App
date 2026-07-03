import type {CompressionSummary} from '@scripts/compressSvg.mjs';
import compressSvg from '@scripts/compressSvg.mjs';

import * as core from '@actions/core';
import {pathToFileURL} from 'url';

async function run() {
    try {
        const token = core.getInput('GITHUB_TOKEN', {required: true});
        const summary: CompressionSummary = await compressSvg('pullRequest', {token});

        if (summary.totalSavings) {
            throw new Error(`SVG ${summary.totalCompressedFilesLength} file(s) were not compressed. Run 'npm run compress-svg' locally and check results on all platforms.`);
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error);
            return;
        }
        core.setFailed('An unknown error occurred.');
    }
}

if (import.meta.url === pathToFileURL(process.argv.at(1) ?? '').href) {
    run();
}

export default run;
