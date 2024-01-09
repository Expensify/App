const core = require('@actions/core');

const run = () => {
    const regressionOutput = JSON.parse(core.getInput('REGRESSION_OUTPUT', {required: true}));
    const countDeviation = core.getInput('COUNT_DEVIATION', {required: true});
    const durationDeviation = core.getInput('DURATION_DEVIATION_PERCENTAGE', {required: true});

    if (regressionOutput.countChanged === undefined || regressionOutput.countChanged.length === 0) {
        console.log('No countChanged data available. Exiting...');
        return true;
    }

    console.log(`Processing ${regressionOutput.countChanged.length} measurements...`);

    for (let i = 0; i < regressionOutput.countChanged.length; i++) {
        const measurement = regressionOutput.countChanged[i];
        const baseline = measurement.baseline;
        const current = measurement.current;

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

module.exports = run;
