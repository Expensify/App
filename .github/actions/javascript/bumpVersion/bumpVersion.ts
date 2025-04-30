import * as core from '@actions/core';
import bumpVersion from '../../../scripts/bumpVersion';

async function run() {
    try {
        const semverLevel = core.getInput('SEMVER_LEVEL', {required: true});
        const newVersion = await bumpVersion(semverLevel);
        core.setOutput('NEW_VERSION', newVersion);
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
