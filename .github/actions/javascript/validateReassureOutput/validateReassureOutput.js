"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var fs_1 = require("fs");
var run = function () {
    var regressionOutput = JSON.parse(fs_1.default.readFileSync('.reassure/output.json', 'utf8'));
    var countDeviation = Number(core.getInput('COUNT_DEVIATION', { required: true }));
    var durationDeviation = Number(core.getInput('DURATION_DEVIATION_PERCENTAGE', { required: true }));
    if (regressionOutput.countChanged === undefined || regressionOutput.countChanged.length === 0) {
        console.log('No countChanged data available. Exiting...');
        return true;
    }
    console.log("Processing ".concat(regressionOutput.countChanged.length, " measurements..."));
    for (var i = 0; i < regressionOutput.countChanged.length; i++) {
        var measurement = regressionOutput.countChanged.at(i);
        if (!measurement) {
            continue;
        }
        var baseline = measurement.baseline;
        var current = measurement.current;
        console.log("Processing measurement ".concat(i + 1, ": ").concat(measurement.name));
        var renderCountDiff = current.meanCount - baseline.meanCount;
        if (renderCountDiff > countDeviation) {
            core.setFailed("Render count difference exceeded the allowed deviation of ".concat(countDeviation, ". Current difference: ").concat(renderCountDiff));
            break;
        }
        else {
            console.log("Render count difference ".concat(renderCountDiff, " is within the allowed deviation range of ").concat(countDeviation, "."));
        }
        var increasePercentage = ((current.meanDuration - baseline.meanDuration) / baseline.meanDuration) * 100;
        if (increasePercentage > durationDeviation) {
            core.setFailed("Duration increase percentage exceeded the allowed deviation of ".concat(durationDeviation, "%. Current percentage: ").concat(increasePercentage, "%"));
            break;
        }
        else {
            console.log("Duration increase percentage ".concat(increasePercentage, "% is within the allowed deviation range of ").concat(durationDeviation, "%."));
        }
    }
    return true;
};
if (require.main === module) {
    run();
}
exports.default = run;
