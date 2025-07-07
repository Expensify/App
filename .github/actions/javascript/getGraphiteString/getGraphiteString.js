"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var fs_1 = require("fs");
var run = function () {
    // Prefix path to the graphite metric
    var GRAPHITE_PATH = 'reassure';
    var PR_NUMBER = core.getInput('PR_NUMBER', { required: true });
    // Read the contents of the file, the file is in the JSONL format
    var regressionFile = fs_1.default.readFileSync('.reassure/baseline.perf', 'utf8');
    // Split file contents by newline to get individual JSON entries
    var regressionEntries = regressionFile.split('\n');
    // Initialize string to store Graphite metrics
    var graphiteString = '';
    var timestamp;
    // Iterate over each entry
    regressionEntries.forEach(function (entry) {
        var _a;
        // Skip empty lines
        if (entry.trim() === '') {
            return;
        }
        try {
            var current = JSON.parse(entry);
            // Extract timestamp, Graphite accepts timestamp in seconds
            if ((_a = current.metadata) === null || _a === void 0 ? void 0 : _a.creationDate) {
                timestamp = Math.floor(new Date(current.metadata.creationDate).getTime() / 1000);
            }
            if (current.name && current.meanDuration && current.meanCount && timestamp) {
                var formattedName = current.name.split(' ').join('-');
                var renderDurationString = "".concat(GRAPHITE_PATH, ".").concat(formattedName, ".renderDuration ").concat(current.meanDuration, " ").concat(timestamp);
                var renderCountString = "".concat(GRAPHITE_PATH, ".").concat(formattedName, ".renderCount ").concat(current.meanCount, " ").concat(timestamp);
                var renderPRNumberString = "".concat(GRAPHITE_PATH, ".").concat(formattedName, ".prNumber ").concat(PR_NUMBER, " ").concat(timestamp);
                // Concatenate Graphite strings
                graphiteString += "".concat(renderDurationString, "\n").concat(renderCountString, "\n").concat(renderPRNumberString, "\n");
            }
        }
        catch (e) {
            var error = new Error('Error parsing baseline.perf JSON file');
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
exports.default = run;
