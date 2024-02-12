/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
const {readFileSync} = require('fs');
const core = require('@actions/core');
const _ = require('underscore');
const versionUpdater = require('../../../libs/versionUpdater');

const semverLevel = core.getInput('SEMVER_LEVEL', {require: true});
if (!semverLevel || !_.contains(versionUpdater.SEMANTIC_VERSION_LEVELS, semverLevel)) {
    core.setFailed(`'Error: Invalid input for 'SEMVER_LEVEL': ${semverLevel}`);
}

const {version: currentVersion} = JSON.parse(readFileSync('./package.json'));
const previousVersion = versionUpdater.getPreviousVersion(currentVersion, semverLevel);
core.setOutput('PREVIOUS_VERSION', previousVersion);
