const utils = require('../utils/utils');

const assertValidateActorJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Get user permissions',
            true,
            null,
            'VALIDATEACTOR',
            'Get user permissions',
            [],
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
const assertCreateNewVersionJobExecuted = (workflowResult, semverLevel = 'BUILD', didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.getStepAssertion(
            'Check out',
            true,
            null,
            'CREATENEWVERSION',
            'Check out',
            [{key: 'fetch-depth', value: '0'}],
            [],
        ),
        utils.getStepAssertion(
            'Setup git for OSBotify',
            true,
            null,
            'CREATENEWVERSION',
            'Setup git for OSBotify',
            [{key: 'GPG_PASSPHRASE', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Run turnstyle',
            true,
            null,
            'CREATENEWVERSION',
            'Run turnstyle',
            [{key: 'poll-interval-seconds', value: '10'}],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
        utils.getStepAssertion(
            'Create new branch',
            true,
            null,
            'CREATENEWVERSION',
            'Create new branch',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Generate version',
            true,
            null,
            'CREATENEWVERSION',
            'Generate version',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SEMVER_LEVEL', value: semverLevel}],
            [],
        ),
        utils.getStepAssertion(
            'Commit new version',
            true,
            null,
            'CREATENEWVERSION',
            'Commit new version',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Update main branch',
            true,
            null,
            'CREATENEWVERSION',
            'Update main branch',
            [
                {key: 'TARGET_BRANCH', value: 'main'},
                {key: 'SOURCE_BRANCH', value: `version-${semverLevel}-abcdef`},
                {key: 'OS_BOTIFY_TOKEN', value: '***'},
                {key: 'GPG_PASSPHRASE', value: '***'},
            ],
            [],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }

    const failedSteps = [
        utils.getStepAssertion(
            'Announce failed workflow in Slack',
            true,
            null,
            'CREATENEWVERSION',
            'Announce failed workflow in Slack',
            [{key: 'SLACK_WEBHOOK', value: '***'}],
            [],
        ),
    ];

    for (const step of failedSteps) {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }
};

module.exports = {
    assertValidateActorJobExecuted,
    assertCreateNewVersionJobExecuted,
};
