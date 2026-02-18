import * as core from '@actions/core';
import * as versionUpdater from '@github/libs/versionUpdater';
import bumpVersion from '@scripts/bumpVersion';

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

if (require.main === module) {
    run();
}

export default run;
