import * as core from '@actions/core';
import fs from 'fs';

type RegressionEntry = {
    metadata?: {
        creationDate: string;
    };
    name: string;
    meanDuration: number;
    meanCount: number;
};

const run = () => {
    // Prefix path to the graphite metric
    const GRAPHITE_PATH = 'reassure';
    const PR_NUMBER = core.getInput('PR_NUMBER', {required: true});

    // Read the contents of the file, the file is in the JSONL format
    const regressionFile = fs.readFileSync('.reassure/baseline.perf', 'utf8');

    // Split file contents by newline to get individual JSON entries
    const regressionEntries = regressionFile.split('\n');

    // Initialize string to store Graphite metrics
    let graphiteString = '';
    let timestamp: number;

    // Iterate over each entry
    regressionEntries.forEach((entry) => {
        // Skip empty lines
        if (entry.trim() === '') {
            return;
        }

        try {
            const current = JSON.parse(entry) as RegressionEntry;

            // Extract timestamp, Graphite accepts timestamp in seconds
            if (current.metadata?.creationDate) {
                timestamp = Math.floor(new Date(current.metadata.creationDate).getTime() / 1000);
            }

            if (current.name && current.meanDuration && current.meanCount && timestamp) {
                const formattedName = current.name.split(' ').join('-');

                const renderDurationString = `${GRAPHITE_PATH}.${formattedName}.renderDuration ${current.meanDuration} ${timestamp}`;
                const renderCountString = `${GRAPHITE_PATH}.${formattedName}.renderCount ${current.meanCount} ${timestamp}`;
                const renderPRNumberString = `${GRAPHITE_PATH}.${formattedName}.prNumber ${PR_NUMBER} ${timestamp}`;

                // Concatenate Graphite strings
                graphiteString += `${renderDurationString}\n${renderCountString}\n${renderPRNumberString}\n`;
            }
        } catch (e) {
            const error = new Error('Error parsing baseline.perf JSON file');
            console.error(error.message);
            core.setFailed(error);
        }
    });

    // Set generated graphite string to the github variable
    core.setOutput('GRAPHITE_STRING', graphiteString);
};

if (require.main === module) {
    run();
}

export default run;
