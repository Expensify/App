"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var run = function () {
    var artifactName = core.getInput('ARTIFACT_NAME', { required: true });
    return GithubUtils_1.default.getArtifactByName(artifactName)
        .then(function (artifact) {
        var _a;
        if (artifact === undefined) {
            console.log("No artifact found with the name ".concat(artifactName));
            core.setOutput('ARTIFACT_FOUND', false);
            return;
        }
        console.log('Artifact info', artifact);
        core.setOutput('ARTIFACT_FOUND', true);
        core.setOutput('ARTIFACT_ID', artifact.id);
        core.setOutput('ARTIFACT_WORKFLOW_ID', (_a = artifact.workflow_run) === null || _a === void 0 ? void 0 : _a.id);
    })
        .catch(function (error) {
        console.error('A problem occurred while trying to communicate with the GitHub API', error);
        core.setFailed(error);
    });
};
if (require.main === module) {
    run();
}
exports.default = run;
