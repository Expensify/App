"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var throttle_1 = require("lodash/throttle");
var ActionUtils_1 = require("@github/libs/ActionUtils");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var promiseWhile_1 = require("@github/libs/promiseWhile");
function run() {
    var tag = (0, ActionUtils_1.getStringInput)('TAG', { required: false });
    var currentStagingDeploys = [];
    var throttleFunc = function () {
        return Promise.all([
            // These are active deploys
            GithubUtils_1.default.octokit.actions.listWorkflowRuns({
                owner: CONST_1.default.GITHUB_OWNER,
                repo: CONST_1.default.APP_REPO,
                workflow_id: 'deploy.yml',
                event: 'push',
                branch: tag,
            }),
            // These have the potential to become active deploys, so we need to wait for them to finish as well (unless we're looking for a specific tag)
            // In this context, we'll refer to unresolved preDeploy workflow runs as staging deploys as well
            !tag &&
                GithubUtils_1.default.octokit.actions.listWorkflowRuns({
                    owner: CONST_1.default.GITHUB_OWNER,
                    repo: CONST_1.default.APP_REPO,
                    workflow_id: 'preDeploy.yml',
                }),
        ])
            .then(function (responses) {
            var workflowRuns = responses[0].data.workflow_runs;
            if (!tag && typeof responses[1] === 'object') {
                workflowRuns.push.apply(workflowRuns, responses[1].data.workflow_runs);
            }
            return workflowRuns;
        })
            .then(function (workflowRuns) { return (currentStagingDeploys = workflowRuns.filter(function (workflowRun) { return workflowRun.status !== 'completed'; })); })
            .then(function () {
            console.log(!currentStagingDeploys.length
                ? 'No current staging deploys found'
                : "Found ".concat(currentStagingDeploys.length, " staging deploy").concat(currentStagingDeploys.length > 1 ? 's' : '', " still running..."));
        });
    };
    return (0, promiseWhile_1.promiseDoWhile)(function () { return !!currentStagingDeploys.length; }, (0, throttle_1.default)(throttleFunc, 
    // Poll every 60 seconds instead of every 10 seconds
    CONST_1.default.POLL_RATE * 6));
}
if (require.main === module) {
    run();
}
exports.default = run;
