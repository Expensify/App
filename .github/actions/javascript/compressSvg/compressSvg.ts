import * as core from '@actions/core';
import type {CompressionSummary} from '@scripts/compressSvg';
import compressSvg, {generateMarkdownSummary} from '@scripts/compressSvg';

function run() {
    try {
        const summary: CompressionSummary = compressSvg('github');

        if (summary.totalSavings > 0) {
            const markdown = generateMarkdownSummary(summary);
            core.setOutput('markdown', markdown);
            core.setOutput('has_changes', 'true');
        } else {
            core.setOutput('markdown', 'No SVG files were compressed.');
            core.setOutput('has_changes', 'false');
        }
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
