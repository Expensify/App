const core = require('@actions/core');

const run = () => {
    const regressionOutput = JSON.parse(core.getInput('REGRESSION_OUTPUT', {required: true}))
    const countDeviation = core.getInput('COUNT_DEVIATION', {required: true});
    const durationDeviation = core.getInput('DURATION_DEVIATION_PERCENTAGE', {required: true});

    if (regressionOutput.countChanged === undefined) {
        return true;
    }

    for (let i; regressionOutput.countChanged.length > i; i++) {
        const measurement = regressionOutput.countChanged[i]
        const baseline = measurement.baseline;
        const current = measurement.current;

        const renderCountDiff = current.meanCount - baseline.meanCount
        if (renderCountDiff >= countDeviation) {
            core.setFailed(`Render count difference exceeded the allowed deviation of ${countDeviation}, current: ${renderCountDiff}`);
            break;
        }

        const increasePercentage = ((current.meanDuration - baseline.meanDuration) / baseline.meanDuration) * 100;
        if (increasePercentage > durationDeviation) {
            core.setFailed(`Duration increase percentage exceeded the allowed deviation of ${durationDeviation}%, current: ${increasePercentage}%`);
            break;
        }
    }

    return true;
}

if (require.main === module) {
    run();
}

module.exports = run;
