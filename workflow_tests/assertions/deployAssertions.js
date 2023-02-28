const utils = require('../utils');

const assertValidateJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
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
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertDeployStagingJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout staging branch',
            true,
            null,
            'DEPLOY_STAGING',
            'Checking out staging branch',
            [{key: 'ref', value: 'staging'}, {key: 'token', value: '***'}],
        ),
        utils.getStepAssertion(
            'Setup git for ***',
            true,
            null,
            'DEPLOY_STAGING',
            'Setting up git for ***',
            [{key: 'GPG_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Tag version',
            true,
            null,
            'DEPLOY_STAGING',
            'Tagging new version',
        ),
        utils.getStepAssertion(
            '🚀 Push tags to trigger staging deploy 🚀',
            true,
            null,
            'DEPLOY_STAGING',
            'Pushing tag to trigger staging deploy',
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertDeployProductionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
        ),
        utils.getStepAssertion(
            'Setup git for ***',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Setting up git for ***',
            [{key: 'GPG_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Checkout production branch',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Checking out production branch',
        ),
        utils.getStepAssertion(
            'Get current app version',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Getting current app version',
        ),
        utils.getStepAssertion(
            'Get Release Pull Request List',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Getting release PR list',
            [{key: 'TAG', value: '1.2.3'}, {key: 'GITHUB_TOKEN', value: '***'}, {key: 'IS_PRODUCTION_DEPLOY', value: 'true'}],
        ),
        utils.getStepAssertion(
            'Generate Release Body',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Generating release body',
            [{key: 'PR_LIST', value: '[1.2.1, 1.2.2]'}],
        ),
        utils.getStepAssertion(
            '🚀 Create release to trigger production deploy 🚀',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Creating release to trigger production deploy',
            [{key: 'tag_name', value: '1.2.3'}, {key: 'body', value: 'Release body'}],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

module.exports = {
    assertValidateJobExecuted,
    assertDeployStagingJobExecuted,
    assertDeployProductionJobExecuted,
};
