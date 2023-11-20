const utils = require('../utils/utils');

const assertCLAJobExecuted = (workflowResult, commentBody = '', githubRepository = '', didExecute = true, runAssistant = true) => {
    const steps = [
        utils.createStepAssertion(
            'CLA comment check',
            true,
            null,
            'CLA',
            'CLA comment check',
            [
                {key: 'text', value: commentBody},
                {key: 'regex', value: '\\s*I have read the CLA Document and I hereby sign the CLA\\s*'},
            ],
            [],
        ),
        utils.createStepAssertion(
            'CLA comment re-check',
            true,
            null,
            'CLA',
            'CLA comment re-check',
            [
                {key: 'text', value: commentBody},
                {key: 'regex', value: '\\s*recheck\\s*'},
            ],
            [],
        ),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const assistantSteps = [
        utils.createStepAssertion(
            'CLA Assistant',
            true,
            null,
            'CLA',
            'CLA Assistant',
            [
                {key: 'path-to-signatures', value: `${githubRepository}/cla.json`},
                {key: 'path-to-document', value: `https://github.com/${githubRepository}/blob/main/contributingGuides/CLA.md`},
                {key: 'branch', value: 'main'},
                {key: 'remote-organization-name', value: 'Expensify'},
                {key: 'remote-repository-name', value: 'CLA'},
                {key: 'lock-pullrequest-aftermerge', value: false},
                {key: 'allowlist', value: 'OSBotify,snyk-bot'},
            ],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'PERSONAL_ACCESS_TOKEN', value: '***'},
            ],
        ),
    ];

    assistantSteps.forEach((step) => {
        if (didExecute && runAssistant) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });
};

module.exports = {
    assertCLAJobExecuted,
};
