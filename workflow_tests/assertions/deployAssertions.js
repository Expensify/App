const utils = require('../utils/utils');

const assertDeployStagingJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Checkout staging branch', true, null, 'DEPLOY_STAGING', 'Checking out staging branch', [
            {key: 'ref', value: 'staging'},
            {key: 'token', value: '***'},
        ]),
        utils.createStepAssertion('Setup git for OSBotify', true, null, 'DEPLOY_STAGING', 'Setting up git for OSBotify', [
            {key: 'GPG_PASSPHRASE', value: '***'},
            {key: 'OS_BOTIFY_APP_ID', value: '***'},
            {key: 'OS_BOTIFY_PRIVATE_KEY', value: '***'},
        ]),
        utils.createStepAssertion('Tag version', true, null, 'DEPLOY_STAGING', 'Tagging new version'),
        utils.createStepAssertion('🚀 Push tags to trigger staging deploy 🚀', true, null, 'DEPLOY_STAGING', 'Pushing tag to trigger staging deploy'),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertDeployProductionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'DEPLOY_PRODUCTION', 'Checking out', [
            {key: 'ref', value: 'production'},
            {key: 'token', value: '***'},
        ]),
        utils.createStepAssertion('Setup git for OSBotify', true, null, 'DEPLOY_PRODUCTION', 'Setting up git for OSBotify', [
            {key: 'GPG_PASSPHRASE', value: '***'},
            {key: 'OS_BOTIFY_APP_ID', value: '***'},
            {key: 'OS_BOTIFY_PRIVATE_KEY', value: '***'},
        ]),
        utils.createStepAssertion('Get current app version', true, null, 'DEPLOY_PRODUCTION', 'Getting current app version'),
        utils.createStepAssertion('Get Release Pull Request List', true, null, 'DEPLOY_PRODUCTION', 'Getting release PR list', [
            {key: 'TAG', value: '1.2.3'},
            {key: 'GITHUB_TOKEN', value: 'os_botify_api_token'},
            {key: 'IS_PRODUCTION_DEPLOY', value: 'true'},
        ]),
        utils.createStepAssertion('Generate Release Body', true, null, 'DEPLOY_PRODUCTION', 'Generating release body', [{key: 'PR_LIST', value: '[1.2.1, 1.2.2]'}]),
        utils.createStepAssertion(
            '🚀 Create release to trigger production deploy 🚀',
            true,
            null,
            'DEPLOY_PRODUCTION',
            'Creating release to trigger production deploy',
            [
                {key: 'tag_name', value: '1.2.3'},
                {key: 'body', value: 'Release body'},
            ],
            [{key: 'GITHUB_TOKEN', value: 'os_botify_api_token'}],
        ),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertDeployStagingJobExecuted,
    assertDeployProductionJobExecuted,
};
