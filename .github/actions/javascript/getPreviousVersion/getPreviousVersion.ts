import GitUtils from '@github/libs/GitUtils';
import * as versionUpdater from '@github/libs/versionUpdater';
import type {SemverLevel} from '@github/libs/versionUpdater';

import type {PackageJson} from 'type-fest';

import * as core from '@actions/core';
import {readFileSync} from 'fs';
import {pathToFileURL} from 'url';

function run() {
    const semverLevel = core.getInput('SEMVER_LEVEL', {required: true});
    if (!semverLevel || !versionUpdater.isValidSemverLevel(semverLevel)) {
        core.setFailed(`'Error: Invalid input for 'SEMVER_LEVEL': ${semverLevel}`);
    }

    const {version: currentVersion} = JSON.parse(readFileSync('./package.json', 'utf8')) as PackageJson;
    if (!currentVersion) {
        core.setFailed('Error: Could not read package.json');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const previousVersion = GitUtils.getPreviousExistingTag(currentVersion!, semverLevel as SemverLevel);
    core.setOutput('PREVIOUS_VERSION', previousVersion);
    return previousVersion;
}

if (import.meta.url === pathToFileURL(process.argv.at(1) ?? '').href) {
    run();
}

export default run;
