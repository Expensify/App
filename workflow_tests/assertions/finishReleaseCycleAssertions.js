const utils = require('../utils/utils');

const assertValidateJobExecuted = (workflowResult, issueNumber = '', didExecute = true, isTeamMember = true, hasBlockers = false, isSuccessful = true) => {
    const steps = [utils.createStepAssertion('Validate actor is deployer', true, null, 'VALIDATE', 'Validating if actor is deployer', [], [{key: 'GITHUB_TOKEN', value: '***'}])];
    if (isTeamMember) {
        steps.push(
            utils.createStepAssertion(
                'Check for any deploy blockers',
                true,
                null,
                'VALIDATE',
                'Checking for deploy blockers',
                [
                    {key: 'GITHUB_TOKEN', value: '***'},
                    {key: 'ISSUE_NUMBER', value: issueNumber},
                ],
                [],
            ),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    // eslint-disable-next-line rulesdir/no-negated-variables
    const notTeamMemberSteps = [
        utils.createStepAssertion(
            'Reopen and comment on issue (not a team member)',
            true,
            null,
            'VALIDATE',
            'Reopening issue - not a team member',
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'ISSUE_NUMBER', value: issueNumber},
                {key: 'COMMENT', value: 'Sorry, only members of @Expensify/Mobile-Deployers can close deploy checklists.\nReopening!'},
            ],
            [],
        ),
    ];

    notTeamMemberSteps.forEach((expectedStep) => {
        if (didExecute && !isTeamMember) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const blockerSteps = [
        utils.createStepAssertion(
            'Reopen and comment on issue (has blockers)',
            true,
            null,
            'VALIDATE',
            'Reopening issue - blockers',
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'ISSUE_NUMBER', value: issueNumber},
            ],
            [],
        ),
    ];

    blockerSteps.forEach((expectedStep) => {
        if (didExecute && hasBlockers) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'VALIDATE', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ];

    failedSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertUpdateProductionJobExecuted = (workflowResult, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout',
            true,
            null,
            'UPDATEPRODUCTION',
            'Checkout',
            [
                {key: 'ref', value: 'staging'},
                {key: 'token', value: '***'},
            ],
            [],
        ),
        utils.createStepAssertion('Setup Git for OSBotify', true, null, 'UPDATEPRODUCTION', 'Setup Git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}], []),
        utils.createStepAssertion('Update production branch', true, null, 'UPDATEPRODUCTION', 'Updating production branch', [], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'UPDATEPRODUCTION', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ];

    failedSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertCreateNewPatchVersionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Create new version', true, null, 'CREATENEWPATCHVERSION', 'Creating new version', [{key: 'SEMVER_LEVEL', value: 'PATCH'}], [])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertUpdateStagingJobExecuted = (workflowResult, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout',
            true,
            null,
            'UPDATESTAGING',
            'Checkout',
            [
                {key: 'ref', value: 'main'},
                {key: 'token', value: '***'},
            ],
            [],
        ),
        utils.createStepAssertion('Setup Git for OSBotify', true, null, 'UPDATESTAGING', 'Setup Git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}], []),
        utils.createStepAssertion('Update staging branch to trigger staging deploy', true, null, 'UPDATESTAGING', 'Updating staging branch', [], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'UPDATESTAGING', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ];

    failedSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertValidateJobExecuted,
    assertUpdateProductionJobExecuted,
    assertCreateNewPatchVersionJobExecuted,
    assertUpdateStagingJobExecuted,
};
