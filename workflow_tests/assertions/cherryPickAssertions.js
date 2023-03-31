const utils = require('../utils/utils');

const assertValidateActorJobExecuted = (workflowResult, username = 'Dummy Author', didExecute = true) => {
    const steps = [
        utils.createStepAssertion(
            'Check if user is deployer',
            true,
            null,
            'VALIDATEACTOR',
            'Checking if user is a deployer',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'username', value: username}, {key: 'team', value: 'mobile-deployers'}],
            [],
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

const assertCreateNewVersionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion(
            'Create new version',
            true,
            null,
            'CREATENEWVERSION',
            'Creating new version',
            [],
            [],
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

const assertCherryPickJobExecuted = (
    workflowResult,
    user = 'Dummy Author',
    pullRequestNumber = '1234',
    newVersion = '1.2.3',
    didExecute = true,
    mergeConflictsOrVersionMismatch = false,
    shouldAutomerge = true,
    versionsMatch = true,
    prIsMergeable = true,
    inputNewVersion = '',
    isSuccessful = true,
) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout staging branch',
            true,
            null,
            'CHERRYPICK',
            'Checking out staging branch',
            [{key: 'ref', value: 'staging'}, {key: 'token', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
            'Set up git for OSBotify',
            true,
            null,
            'CHERRYPICK',
            'Setting up git for OSBotify',
            [{key: 'GPG_PASSPHRASE', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
            'Create branch for new pull request',
            true,
            null,
            'CHERRYPICK',
            'Creating branch for new pull request',
            [],
            [],
        ),
        utils.createStepAssertion(
            'Get merge commit for CP pull request',
            true,
            null,
            'CHERRYPICK',
            'Getting merge commit for CP pull request',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'USER', value: user}, {key: 'PULL_REQUEST_NUMBER', value: pullRequestNumber}],
            [],
        ),
        utils.createStepAssertion(
            'Save correct NEW_VERSION to env',
            true,
            inputNewVersion ? `New version is ${inputNewVersion}` : 'New version is',
        ),
        utils.createStepAssertion(
            'Get merge commit for version-bump pull request',
            true,
            null,
            'CHERRYPICK',
            'Getting merge commit for version-bump pull request',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'USER', value: 'OSBotify'}, {key: 'TITLE_REGEX', value: `Update version to ${newVersion}`}],
            [],
        ),
        utils.createStepAssertion(
            'Cherry-pick the version-bump to new branch',
            true,
            null,
            'CHERRYPICK',
            'Cherry-picking the version-bump to new branch',
            [],
            [],
        ),
        utils.createStepAssertion(
            'Cherry-pick the merge commit of target PR to new branch',
            true,
            null,
            'CHERRYPICK',
            'Cherry-picking the merge commit of target PR to new branch',
            [],
            [],
        ),
        utils.createStepAssertion(
            'Push changes to CP branch',
            true,
            null,
            'CHERRYPICK',
            'Pushing changes to CP branch',
            [],
            [],
        ),
        utils.createStepAssertion(
            'Create Pull Request',
            true,
            null,
            'CHERRYPICK',
            'Creating Pull Request',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
        utils.createStepAssertion(
            'Check if ShortVersionString is up to date',
            true,
            null,
            'CHERRYPICK',
            'Checking if ShortVersionString is up to date',
            [],
            [],
        ),
        utils.createStepAssertion(
            'Check if pull request is mergeable',
            true,
            null,
            'CHERRYPICK',
            'Checking if pull request is mergeable',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'PULL_REQUEST_NUMBER', value: pullRequestNumber}],
            [],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }

    const conflictsSteps = [
        utils.createStepAssertion(
            'Auto-assign PR if there are merge conflicts or if the bundle versions are mismatched',
            true,
            null,
            'CHERRYPICK',
            'Auto-assigning PR',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const step of conflictsSteps) {
        if (didExecute && mergeConflictsOrVersionMismatch) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }

    const manualMergeSteps = [
        utils.createStepAssertion(
            'Assign the PR to the deployer',
            true,
            null,
            'CHERRYPICK',
            'Assigning the PR to the deployer',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
        utils.createStepAssertion(
            'If PR has merge conflicts, comment with instructions for assignee',
            true,
            null,
            'CHERRYPICK',
            'Commenting with instructions for assignee',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const step of manualMergeSteps) {
        if (didExecute && !shouldAutomerge) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }

    const autoMergeSteps = [
        utils.createStepAssertion(
            'Auto-approve the PR',
            true,
            null,
            'CHERRYPICK',
            'Auto-approving the PR',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const step of autoMergeSteps) {
        if (didExecute && shouldAutomerge) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }

    const versionMismatchSteps = [
        utils.createStepAssertion(
            'If PR has a bundle version mismatch, comment with the instructions for assignee',
            true,
            null,
            'CHERRYPICK',
            'Commenting with the instructions for assignee',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const step of versionMismatchSteps) {
        if (didExecute && !versionsMatch) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }

    const failedSteps = [
        utils.createStepAssertion(
            'Announces a CP failure in the #announce Slack room',
            true,
            null,
            'CHERRYPICK',
            'Announcing a CP failure',
            [{key: 'status', value: 'custom'}],
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
        ),
    ];

    for (const step of failedSteps) {
        if (didExecute && (!isSuccessful || !prIsMergeable)) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }

    const autoMergeableSteps = [
        utils.createStepAssertion(
            'Auto-merge the PR',
            true,
            null,
            'CHERRYPICK',
            'Auto-merging the PR',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const step of autoMergeableSteps) {
        if (didExecute && shouldAutomerge && prIsMergeable) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }
};

module.exports = {
    assertValidateActorJobExecuted,
    assertCreateNewVersionJobExecuted,
    assertCherryPickJobExecuted,
};
