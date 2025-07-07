"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var format = require("./format");
var printRegularLine = function (entry) {
    console.debug(" - ".concat(entry.name, ": ").concat(format.formatMetricDiffChange(entry)));
};
/**
 * Prints the result simply to console.
 */
exports.default = (function (data, skippedTests) {
    // No need to log errors or warnings as these were be logged on the fly
    console.debug('');
    console.debug('❇️  Performance comparison results:');
    console.debug('\n➡️  Significant changes to duration');
    data.significance.forEach(printRegularLine);
    console.debug('\n➡️  Meaningless changes to duration');
    data.meaningless.forEach(printRegularLine);
    console.debug('');
    if (skippedTests.length > 0) {
        console.debug("\u26A0\uFE0F Some tests did not pass successfully, so some results are omitted from final report: ".concat(skippedTests.join(', ')));
    }
});
