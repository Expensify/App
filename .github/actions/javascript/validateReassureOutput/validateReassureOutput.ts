import * as core from '@actions/core';
import {compare} from '@callstack/reassure-compare';
import type {CompareResult, MeasureEntry} from '@callstack/reassure-compare';
import fs from 'fs';

const OUTPUT_FILE = '.reassure/output.json';
const BASELINE_FILE = '.reassure/baseline.perf';
const CURRENT_FILE = '.reassure/current.perf';

const run = async (): Promise<boolean> => {
    const countDeviation = Number(core.getInput('COUNT_DEVIATION', {required: true}));
    const durationDeviation = Number(core.getInput('DURATION_DEVIATION_PERCENTAGE', {required: true}));

    if (!fs.existsSync(OUTPUT_FILE)) {
        console.log('output.json not found, running comparison from perf files...');

        if (!fs.existsSync(BASELINE_FILE)) {
            core.setFailed(`Baseline file "${BASELINE_FILE}" does not exist.`);
            return false;
        }

        if (!fs.existsSync(CURRENT_FILE)) {
            core.setFailed(`Current file "${CURRENT_FILE}" does not exist.`);
            return false;
        }

        await compare({
            baselineFile: BASELINE_FILE,
            currentFile: CURRENT_FILE,
            outputFile: OUTPUT_FILE,
            outputFormat: 'all',
        });

        console.log('Comparison complete, output.json generated.');
    }

    const regressionOutput = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')) as CompareResult;

    if (regressionOutput.countChanged === undefined || regressionOutput.countChanged.length === 0) {
        console.log('No countChanged data available. Exiting...');
        return true;
    }

    console.log(`Processing ${regressionOutput.countChanged.length} measurements...`);

    for (let i = 0; i < regressionOutput.countChanged.length; i++) {
        const measurement = regressionOutput.countChanged.at(i);

        if (!measurement) {
            continue;
        }

        const baseline: MeasureEntry = measurement.baseline;
        const current: MeasureEntry = measurement.current;

        console.log(`Processing measurement ${i + 1}: ${measurement.name}`);

        const renderCountDiff = current.meanCount - baseline.meanCount;
        if (renderCountDiff > countDeviation) {
            core.setFailed(`Render count difference exceeded the allowed deviation of ${countDeviation}. Current difference: ${renderCountDiff}`);
            break;
        } else {
            console.log(`Render count difference ${renderCountDiff} is within the allowed deviation range of ${countDeviation}.`);
        }

        const increasePercentage = ((current.meanDuration - baseline.meanDuration) / baseline.meanDuration) * 100;
        if (increasePercentage > durationDeviation) {
            core.setFailed(`Duration increase percentage exceeded the allowed deviation of ${durationDeviation}%. Current percentage: ${increasePercentage}%`);
            break;
        } else {
            console.log(`Duration increase percentage ${increasePercentage}% is within the allowed deviation range of ${durationDeviation}%.`);
        }
    }

    return true;
};

if (require.main === module) {
    run();
}

export default run;
