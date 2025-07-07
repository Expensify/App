"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var fs_1 = require("fs");
var GitUtils_1 = require("@github/libs/GitUtils");
var versionUpdater = require("@github/libs/versionUpdater");
function run() {
    var semverLevel = core.getInput('SEMVER_LEVEL', { required: true });
    if (!semverLevel || !versionUpdater.isValidSemverLevel(semverLevel)) {
        core.setFailed("'Error: Invalid input for 'SEMVER_LEVEL': ".concat(semverLevel));
    }
    var currentVersion = JSON.parse((0, fs_1.readFileSync)('./package.json', 'utf8')).version;
    if (!currentVersion) {
        core.setFailed('Error: Could not read package.json');
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    var previousVersion = GitUtils_1.default.getPreviousExistingTag(currentVersion, semverLevel);
    core.setOutput('PREVIOUS_VERSION', previousVersion);
    return previousVersion;
}
if (require.main === module) {
    run();
}
exports.default = run;
