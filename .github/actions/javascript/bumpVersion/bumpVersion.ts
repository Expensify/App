import * as versionUpdater from '@github/libs/versionUpdater';

import bumpVersion from '@scripts/bumpVersion';

import * as core from '@actions/core';
import {pathToFileURL} from 'url';

async function run() {
    try {
        const semverLevel = core.getInput('SEMVER_LEVEL', {required: true});
        if (!versionUpdater.isValidSemverLevel(semverLevel)) {
            throw new Error(`Invalid SEMVER_LEVEL ${semverLevel}`);
        }
        const newVersion = await bumpVersion(semverLevel);
        core.setOutput('NEW_VERSION', newVersion);
        core.notice(`New version is ${newVersion}`);
    } catch (e) {
        if (e instanceof Error) {
            core.setFailed(e);
            return;
        }
        core.setFailed('An unknown error occurred.');
    }
}

if (import.meta.url === pathToFileURL(process.argv.at(1) ?? '').href) {
    run();
}

export default run;
