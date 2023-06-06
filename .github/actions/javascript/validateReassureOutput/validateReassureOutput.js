const core = require('@actions/core');

const run = () => {
    const regressionOutput = JSON.parse(core.getInput('REGRESSION_OUTPUT', {required: true}));
    const countDeviation = core.getInput('COUNT_DEVIATION', {required: true});
    const durationDeviation = core.getInput('DURATION_DEVIATION_PERCENTAGE', {required: true});

    console.log('Input values:');
    console.log('REGRESSION_OUTPUT:', regressionOutput);
    console.log('COUNT_DEVIATION:', countDeviation);
    console.log('DURATION_DEVIATION_PERCENTAGE:', durationDeviation);

    if (regressionOutput.countChanged === undefined) {
        console.log('No countChanged data available. Exiting...');
        return true;
    }

    for (let i = 0; i < regressionOutput.countChanged.length; i++) {
        const measurement = regressionOutput.countChanged[i];
        const baseline = measurement.baseline;
        const current = measurement.current;

        console.log(`Processing measurement ${i + 1}:`);
        console.log('Measurement:', measurement);
        console.log('Baseline:', baseline);
        console.log('Current:', current);

        const renderCountDiff = current.meanCount - baseline.meanCount;
        console.log('Render count difference:', renderCountDiff);

        if (renderCountDiff >= countDeviation) {
            console.log(`Render count difference exceeded the allowed deviation of ${countDeviation}. Current difference: ${renderCountDiff}`);
            core.setFailed(`Render count difference exceeded the allowed deviation of ${countDeviation}. Current difference: ${renderCountDiff}`);
            break;
        }

        const increasePercentage = ((current.meanDuration - baseline.meanDuration) / baseline.meanDuration) * 100;
        console.log('Duration increase percentage:', increasePercentage);

        if (increasePercentage > durationDeviation) {
            console.log(`Duration increase percentage exceeded the allowed deviation of ${durationDeviation}%. Current percentage: ${increasePercentage}%`);
            core.setFailed(`Duration increase percentage exceeded the allowed deviation of ${durationDeviation}%. Current percentage: ${increasePercentage}%`);
            break;
        }
    }

    return true;
};

if (require.main === module) {
    run();
}

module.exports = run;
