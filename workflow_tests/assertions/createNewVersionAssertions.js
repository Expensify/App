const utils = require('../utils/utils');

const assertValidateActorJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Get user permissions', true, null, 'VALIDATEACTOR', 'Get user permissions', [], [{key: 'GITHUB_TOKEN', value: '***'}])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};
const assertCreateNewVersionJobExecuted = (workflowResult, semverLevel = 'BUILD', didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion('Run turnstyle', true, null, 'CREATENEWVERSION', 'Run turnstyle', [{key: 'poll-interval-seconds', value: '10'}], [{key: 'GITHUB_TOKEN', value: '***'}]),
        utils.createStepAssertion(
            'Check out',
            true,
            null,
            'CREATENEWVERSION',
            'Check out',
            [
                {key: 'ref', value: 'main'},
                {key: 'token', value: '***'},
            ],
            [],
        ),
        utils.createStepAssertion(
            'Setup git for OSBotify',
            true,
            null,
            'CREATENEWVERSION',
            'Setup git for OSBotify',
            [
                {key: 'GPG_PASSPHRASE', value: '***'},
                {key: 'OS_BOTIFY_APP_ID', value: '***'},
                {key: 'OS_BOTIFY_PRIVATE_KEY', value: '***'},
            ],
            [],
        ),
        utils.createStepAssertion(
            'Generate version',
            true,
            null,
            'CREATENEWVERSION',
            'Generate version',
            [
                {key: 'GITHUB_TOKEN', value: 'os_botify_api_token'},
                {key: 'SEMVER_LEVEL', value: semverLevel},
            ],
            [],
        ),
        utils.createStepAssertion('Commit new version', true, null, 'CREATENEWVERSION', 'Commit new version', [], []),
        utils.createStepAssertion('Update main branch', true, null, 'CREATENEWVERSION', 'Update main branch', [], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'CREATENEWVERSION', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ];

    failedSteps.forEach((step) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });
};

module.exports = {
    assertValidateActorJobExecuted,
    assertCreateNewVersionJobExecuted,
};
