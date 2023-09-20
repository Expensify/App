const utils = require('../utils/utils');

// deployblocker
const DEPLOYBLOCKER__DEPLOYBLOCKER__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'DEPLOYBLOCKER', ['token'], []);
const DEPLOYBLOCKER__DEPLOYBLOCKER__GET_URL_TITLE_AND_NUMBER_OF_NEW_DEPLOY_BLOCKER_ISSUE__STEP_MOCK = utils.createMockStep(
    'Get URL, title, & number of new deploy blocker (issue)',
    'Get URL, title and number of new deploy blocker - issue',
    'DEPLOYBLOCKER',
    [],
    ['TITLE'],
    {},
    {
        // eslint-disable-next-line no-template-curly-in-string
        DEPLOY_BLOCKER_URL: '${{ github.event.issue.html_url }}',
        // eslint-disable-next-line no-template-curly-in-string
        DEPLOY_BLOCKER_NUMBER: '${{ github.event.issue.number }}',
        // eslint-disable-next-line no-template-curly-in-string
        DEPLOY_BLOCKER_TITLE: '${{ github.event.issue.title }}',
    },
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__UPDATE_STAGINGDEPLOYCASH_WITH_NEW_DEPLOY_BLOCKER__STEP_MOCK = utils.createMockStep(
    'Update StagingDeployCash with new deploy blocker',
    'Update StagingDeployCash with new deploy blocker',
    'DEPLOYBLOCKER',
    ['GITHUB_TOKEN'],
    [],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__GIVE_THE_ISSUE_OR_PR_THE_HOURLY_ENGINEERING_LABELS__STEP_MOCK = utils.createMockStep(
    'Give the issue/PR the Hourly, Engineering labels',
    'Give the issue/PR the Hourly, Engineering labels',
    'DEPLOYBLOCKER',
    ['add-labels', 'remove-labels'],
    [],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__POST_THE_ISSUE_IN_THE_EXPENSIFY_OPEN_SOURCE_SLACK_ROOM__STEP_MOCK = utils.createMockStep(
    'Post the issue in the #expensify-open-source slack room',
    'Post the issue in the expensify-open-source slack room',
    'DEPLOYBLOCKER',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__COMMENT_ON_DEFERRED_PR__STEP_MOCK = utils.createMockStep(
    'Comment on deferred PR',
    'Comment on deferred PR',
    'DEPLOYBLOCKER',
    ['github_token', 'number'],
    [],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__ANNOUNCE_FAILED_WORKFLOW_IN_SLACK__STEP_MOCK = utils.createMockStep(
    'Announce failed workflow in Slack',
    'Announce failed workflow in Slack',
    'DEPLOYBLOCKER',
    ['SLACK_WEBHOOK'],
    [],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__STEP_MOCKS = [
    DEPLOYBLOCKER__DEPLOYBLOCKER__CHECKOUT__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__GET_URL_TITLE_AND_NUMBER_OF_NEW_DEPLOY_BLOCKER_ISSUE__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__UPDATE_STAGINGDEPLOYCASH_WITH_NEW_DEPLOY_BLOCKER__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__GIVE_THE_ISSUE_OR_PR_THE_HOURLY_ENGINEERING_LABELS__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__POST_THE_ISSUE_IN_THE_EXPENSIFY_OPEN_SOURCE_SLACK_ROOM__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__COMMENT_ON_DEFERRED_PR__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__ANNOUNCE_FAILED_WORKFLOW_IN_SLACK__STEP_MOCK,
];

module.exports = {
    DEPLOYBLOCKER__DEPLOYBLOCKER__STEP_MOCKS,
};
