import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertValidateActorJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Get user permissions', true, null, 'VALIDATEACTOR', 'Get user permissions', [], [{key: 'GITHUB_TOKEN', value: '***'}])] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertCreateNewVersionJobExecuted(workflowResult: Step[], semverLevel = 'BUILD', didExecute = true, isSuccessful = true) {
    const steps = [
        createStepAssertion('Run turnstyle', true, null, 'CREATENEWVERSION', 'Run turnstyle', [{key: 'poll-interval-seconds', value: '10'}], [{key: 'GITHUB_TOKEN', value: '***'}]),
        createStepAssertion(
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
        createStepAssertion('Setup git for OSBotify', true, null, 'CREATENEWVERSION', 'Setup git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}], []),
        createStepAssertion(
            'Generate version',
            true,
            null,
            'CREATENEWVERSION',
            'Generate version',
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SEMVER_LEVEL', value: semverLevel},
            ],
            [],
        ),
        createStepAssertion('Commit new version', true, null, 'CREATENEWVERSION', 'Commit new version', [], []),
        createStepAssertion('Update main branch', true, null, 'CREATENEWVERSION', 'Update main branch', [], []),
    ] as const;

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
        createStepAssertion('Announce failed workflow in Slack', true, null, 'CREATENEWVERSION', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    failedSteps.forEach((step) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });
}

export default {assertValidateActorJobExecuted, assertCreateNewVersionJobExecuted};
