const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../../libs/GithubUtils');

const run = function () {
    const artefactName = core.getInput('ARTEFACT_NAME', {required: true});

    return GithubUtils.getArtefactByName(artefactName)
        .then((artefact) => {
            if (_.isUndefined(artefact)) {
                console.log(`No artefact found with the name ${artefactName}`);
                core.setOutput('ARTEFACT_FOUND', false);
                return;
            }

            console.log('Artefact info', artefact);
            core.setOutput('ARTEFACT_FOUND', true);
            core.setOutput('ARTEFACT_ID', artefact.id);
            core.setOutput('ARTEFACT_WORKFLOW_ID', artefact.workflow_run.id);
        })
        .catch((error) => {
            console.error('A problem occurred while trying to communicate with the GitHub API', error);
            core.setFailed(error);
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
