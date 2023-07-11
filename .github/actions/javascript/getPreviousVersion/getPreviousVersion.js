const core = require('@actions/core');
const _ = require('underscore');
const semverValid = require('semver/functions/valid');
const versionUpdater = require('../../../libs/versionUpdater');

const currentVersion = core.getInput('CURRENT_VERSION', {require: true});
if (!semverValid(currentVersion)) {
    core.setFailed(`Error: CURRENT_VERSION ${currentVersion} is not a valid semver version`);
}

let semverLevel = core.getInput('SEMVER_LEVEL', {require: true});
if (!semverLevel || !_.contains(versionUpdater.SEMANTIC_VERSION_LEVELS, semverLevel)) {
    semverLevel = versionUpdater.SEMANTIC_VERSION_LEVELS.PATCH;
    console.warn(`Invalid input for 'SEMVER_LEVEL': ${semverLevel}`, `Defaulting to: ${semverLevel}`);
}

const previousVersion = versionUpdater.getPreviousVersion(currentVersion, semverLevel);
core.setOutput('PREVIOUS_VERSION', previousVersion);
