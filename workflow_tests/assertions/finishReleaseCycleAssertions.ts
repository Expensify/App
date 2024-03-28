import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertValidateJobExecuted(workflowResult: Step[], issueNumber = '', didExecute = true, isTeamMember = true, hasBlockers = false, isSuccessful = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'VALIDATE', 'Checkout', [
            {key: 'ref', value: 'main'},
            {key: 'token', value: '***'},
        ]),
        createStepAssertion('Setup git for OSBotify', true, null, 'VALIDATE', 'Setup git for OSBotify', [
            {key: 'GPG_PASSPHRASE', value: '***'},
            {key: 'OS_BOTIFY_APP_ID', value: '***'},
            {key: 'OS_BOTIFY_PRIVATE_KEY', value: '***'},
        ]),
        createStepAssertion('Validate actor is deployer', true, null, 'VALIDATE', 'Validating if actor is deployer', [], [{key: 'GITHUB_TOKEN', value: 'os_botify_api_token'}]),
    ];

    if (isTeamMember) {
        steps.push(
            createStepAssertion(
                'Check for any deploy blockers',
                true,
                null,
                'VALIDATE',
                'Checking for deploy blockers',
                [
                    {key: 'GITHUB_TOKEN', value: 'os_botify_api_token'},
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
        createStepAssertion(
            'Reopen and comment on issue (not a team member)',
            true,
            null,
            'VALIDATE',
            'Reopening issue - not a team member',
            [
                {key: 'GITHUB_TOKEN', value: 'os_botify_api_token'},
                {key: 'ISSUE_NUMBER', value: issueNumber},
                {key: 'COMMENT', value: 'Sorry, only members of @Expensify/Mobile-Deployers can close deploy checklists.\nReopening!'},
            ],
            [],
        ),
    ] as const;

    notTeamMemberSteps.forEach((expectedStep) => {
        if (didExecute && !isTeamMember) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const blockerSteps = [
        createStepAssertion(
            'Reopen and comment on issue (has blockers)',
            true,
            null,
            'VALIDATE',
            'Reopening issue - blockers',
            [
                {key: 'GITHUB_TOKEN', value: 'os_botify_api_token'},
                {key: 'ISSUE_NUMBER', value: issueNumber},
            ],
            [],
        ),
    ] as const;

    blockerSteps.forEach((expectedStep) => {
        if (didExecute && hasBlockers) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        createStepAssertion('Announce failed workflow in Slack', true, null, 'VALIDATE', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    failedSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertUpdateProductionJobExecuted(workflowResult: Step[], didExecute = true, isSuccessful = true) {
    const steps = [
        createStepAssertion(
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
        createStepAssertion('Setup git for OSBotify', true, null, 'UPDATEPRODUCTION', 'Setup git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}], []),
        createStepAssertion('Update production branch', true, null, 'UPDATEPRODUCTION', 'Updating production branch', [], []),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        createStepAssertion('Announce failed workflow in Slack', true, null, 'UPDATEPRODUCTION', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    failedSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertCreateNewPatchVersionJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Create new version', true, null, 'CREATENEWPATCHVERSION', 'Creating new version', [{key: 'SEMVER_LEVEL', value: 'PATCH'}], [])] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertUpdateStagingJobExecuted(workflowResult: Step[], didExecute = true, isSuccessful = true) {
    const steps = [
        createStepAssertion(
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
        createStepAssertion('Setup git for OSBotify', true, null, 'UPDATESTAGING', 'Setup git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}], []),
        createStepAssertion('Update staging branch to trigger staging deploy', true, null, 'UPDATESTAGING', 'Updating staging branch', [], []),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        createStepAssertion('Announce failed workflow in Slack', true, null, 'UPDATESTAGING', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    failedSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {assertValidateJobExecuted, assertUpdateProductionJobExecuted, assertCreateNewPatchVersionJobExecuted, assertUpdateStagingJobExecuted};
