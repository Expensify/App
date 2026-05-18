import * as core from '@actions/core';
import GithubUtils from '@github/libs/GithubUtils';

const run = function (): Promise<void> {
    const artifactName = core.getInput('ARTIFACT_NAME', {required: true});

    return GithubUtils.getArtifactByName(artifactName)
        .then((artifact) => {
            if (artifact === undefined) {
                console.log(`No artifact found with the name ${artifactName}`);
                core.setOutput('ARTIFACT_FOUND', false);
                return;
            }

            console.log('Artifact info', artifact);
            core.setOutput('ARTIFACT_FOUND', true);
            core.setOutput('ARTIFACT_ID', artifact.id);
            core.setOutput('ARTIFACT_WORKFLOW_ID', artifact.workflow_run?.id);
        })
        .catch((error: Error) => {
            console.error('A problem occurred while trying to communicate with the GitHub API', error);
            core.setFailed(error);
        });
};

if (require.main === module) {
    run();
}

export default run;
