import * as core from '@actions/core';
import {readFileSync} from 'fs';
import type {PackageJson} from 'type-fest';
import * as versionUpdater from '@github/libs/versionUpdater';

const semverLevel = core.getInput('SEMVER_LEVEL', {required: true});
if (!semverLevel || !Object.values<string>(versionUpdater.SEMANTIC_VERSION_LEVELS).includes(semverLevel)) {
    core.setFailed(`'Error: Invalid input for 'SEMVER_LEVEL': ${semverLevel}`);
}

const {version: currentVersion}: PackageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
if (!currentVersion) {
    core.setFailed('Error: Could not read package.json');
}

const previousVersion = versionUpdater.getPreviousVersion(currentVersion ?? '', semverLevel);
core.setOutput('PREVIOUS_VERSION', previousVersion);
