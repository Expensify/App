const {readFileSync} = require('fs');
const core = require('@actions/core');
const _ = require('underscore');
const versionUpdater = require('../../../libs/versionUpdater');

let semverLevel = core.getInput('SEMVER_LEVEL', {require: true});
if (!semverLevel || !_.contains(versionUpdater.SEMANTIC_VERSION_LEVELS, semverLevel)) {
    semverLevel = versionUpdater.SEMANTIC_VERSION_LEVELS.PATCH;
    console.warn(`Invalid input for 'SEMVER_LEVEL': ${semverLevel}`, `Defaulting to: ${semverLevel}`);
}

const {version: currentVersion} = JSON.parse(readFileSync('./package.json'));
const previousVersion = versionUpdater.getPreviousVersion(currentVersion, semverLevel);
core.setOutput('PREVIOUS_VERSION', previousVersion);
