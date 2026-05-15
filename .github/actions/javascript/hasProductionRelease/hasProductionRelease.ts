import * as core from '@actions/core';
import {getLastClosedDeployChecklist} from '@github/libs/DeployChecklistUtils';
import GithubUtils from '@github/libs/GithubUtils';
import CONST from '@github/libs/CONST';

const run = async function (): Promise<void> {
    let version: string;
    try {
        const checklist = await getLastClosedDeployChecklist();
        version = checklist.version;
        console.log(`Last closed deploy checklist references version: ${version}`);
    } catch (err) {
        console.warn('No closed deploy checklist found, continuing with deploy:', err);
        core.setOutput('HAS_PRODUCTION_RELEASE', true);
        return;
    }

    if (!version) {
        console.warn('Could not extract version from closed deploy checklist, continuing with deploy');
        core.setOutput('HAS_PRODUCTION_RELEASE', true);
        return;
    }

    // Production releases use the bare version as the tag (staging releases append "-staging"
    // and are flagged as pre-releases). A non-prerelease release for this tag confirms the
    // previous deploy cycle completed before we start a new staging cycle.
    try {
        const {data: release} = await GithubUtils.octokit.repos.getReleaseByTag({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            tag: version,
        });

        if (release.prerelease) {
            console.log(`Release for version ${version} is a pre-release, blocking deploy`);
            core.setOutput('HAS_PRODUCTION_RELEASE', false);
        } else {
            console.log(`Found production release for version ${version}`);
            core.setOutput('HAS_PRODUCTION_RELEASE', true);
        }
    } catch (err) {
        console.log(`No release found for version ${version}, blocking deploy`);
        core.setOutput('HAS_PRODUCTION_RELEASE', false);
    }
};

if (require.main === module) {
    run();
}

export default run;
