const utils = require('../utils/utils');

const assertValidateJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion(
            'Get merged pull request',
            true,
            null,
            'VALIDATE',
            'Getting merged PR',
            [{key: 'github_token', value: '***'}],
        ),
        {
            name: 'Main Check if merged pull request was an automatic version bump PR',
            status: 0,
            output: '',
        },
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};

const assertDeployStagingJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout staging branch',
            true,
            null,
            'DEPLOY_STAGING',
            'Checking out staging branch',
            [{key: 'ref', value: 'staging'}, {key: 'token', value: '***'}],
        ),
        utils.createStepAssertion(
            'Setup git for OSBotify',
            true,
            null,
            'DEPLOY_STAGING',
            'Setting up git for OSBotify',
            [{key: 'GPG_PASSPHRASE', value: '***'}],
        ),
        utils.createStepAssertion(
            'Tag version',
            true,
            null,
            'DEPLOY_STAGING',
            'Tagging new version',
        ),
        utils.createStepAssertion(
            '🚀 Push tags to trigger staging deploy 🚀',
            true,
            null,
            'DEPLOY_STAGING',
            'Pushing tag to trigger staging deploy',
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};

const assertDeployProductionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
        ),
        utils.createStepAssertion(
            'Setup git for OSBotify',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Setting up git for OSBotify',
            [{key: 'GPG_PASSPHRASE', value: '***'}],
        ),
        utils.createStepAssertion(
            'Checkout production branch',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Checking out production branch',
        ),
        utils.createStepAssertion(
            'Get current app version',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Getting current app version',
        ),
        utils.createStepAssertion(
            'Get Release Pull Request List',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Getting release PR list',
            [{key: 'TAG', value: '1.2.3'}, {key: 'GITHUB_TOKEN', value: '***'}, {key: 'IS_PRODUCTION_DEPLOY', value: 'true'}],
        ),
        utils.createStepAssertion(
            'Generate Release Body',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Generating release body',
            [{key: 'PR_LIST', value: '[1.2.1, 1.2.2]'}],
        ),
        utils.createStepAssertion(
            '🚀 Create release to trigger production deploy 🚀',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Creating release to trigger production deploy',
            [{key: 'tag_name', value: '1.2.3'}, {key: 'body', value: 'Release body'}],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};

module.exports = {
    assertValidateJobExecuted,
    assertDeployStagingJobExecuted,
    assertDeployProductionJobExecuted,
};
