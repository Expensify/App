"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var run = function () {
    return GithubUtils_1.default.getStagingDeployCash()
        .then(function (_a) {
        var labels = _a.labels, number = _a.number;
        var labelsNames = labels.map(function (label) {
            if (typeof label === 'string') {
                return '';
            }
            return label.name;
        });
        console.log("Found StagingDeployCash with labels: ".concat(JSON.stringify(labelsNames)));
        core.setOutput('IS_LOCKED', labelsNames.includes('🔐 LockCashDeploys 🔐'));
        core.setOutput('NUMBER', number);
    })
        .catch(function (err) {
        console.warn('No open StagingDeployCash found, continuing...', err);
        core.setOutput('IS_LOCKED', false);
        core.setOutput('NUMBER', 0);
    });
};
if (require.main === module) {
    run();
}
exports.default = run;
