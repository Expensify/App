import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertTypecheckJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Run typecheck workflow', true, null, 'TYPECHECK', 'Running typecheck workflow')] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertLintJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Run lint workflow', true, null, 'LINT', 'Running lint workflow')] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertTestJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Run test workflow', true, null, 'TEST', 'Running test workflow')] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertChooseDeployActionsJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Get merged pull request', true, null, 'CHOOSE_DEPLOY_ACTIONS', 'Getting merged pull request', [{key: 'github_token', value: '***'}]),
        createStepAssertion('Check if StagingDeployCash is locked', true, null, 'CHOOSE_DEPLOY_ACTIONS', 'Checking StagingDeployCash', [{key: 'GITHUB_TOKEN', value: '***'}]),
        createStepAssertion('Check if merged pull request should trigger a deploy', true, ''),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertSkipDeployJobExecuted(workflowResult: Step[], didExecute = true) {
    const body = ':hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically deployed to staging after the next production release.';
    const steps = [
        createStepAssertion('Comment on deferred PR', true, null, 'SKIP_DEPLOY', 'Skipping deploy', [
            {key: 'github_token', value: '***'},
            {key: 'number', value: '123'},
            {key: 'body', value: body},
        ]),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertCreateNewVersionJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Create new version', true, null, 'CREATE_NEW_VERSION', 'Creating new version')] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertUpdateStagingJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Run turnstyle', true, null, 'UPDATE_STAGING', 'Running turnstyle', [
            {key: 'poll-interval-seconds', value: '10'},
            {key: 'GITHUB_TOKEN', value: '***'},
        ]),
        createStepAssertion('Checkout main', true, null, 'UPDATE_STAGING', 'Checkout main', [
            {key: 'ref', value: 'main'},
            {key: 'token', value: '***'},
        ]),
        createStepAssertion('Setup Git for OSBotify', true, null, 'UPDATE_STAGING', 'Setup Git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}]),
        createStepAssertion('Update staging branch from main', true, null, 'UPDATE_STAGING', 'Update staging branch from main'),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertUpdateStagingJobFailed(workflowResult: Step[], didFail = false) {
    const steps = [
        createStepAssertion('Announce failed workflow in Slack', true, null, 'UPDATE_STAGING', 'Announcing failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}]),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didFail) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {
    assertTypecheckJobExecuted,
    assertLintJobExecuted,
    assertTestJobExecuted,
    assertChooseDeployActionsJobExecuted,
    assertSkipDeployJobExecuted,
    assertCreateNewVersionJobExecuted,
    assertUpdateStagingJobExecuted,
    assertUpdateStagingJobFailed,
};
