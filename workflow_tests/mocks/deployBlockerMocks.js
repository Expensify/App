const utils = require('../utils/utils');

// updateChecklist
const DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCK = utils.createMockStep('updateChecklist', 'Run updateChecklist', 'UPDATECHECKLIST');
const DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCKS = [DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCK];

// deployblocker
const DEPLOYBLOCKER__DEPLOYBLOCKER__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'DEPLOYBLOCKER');
const DEPLOYBLOCKER__DEPLOYBLOCKER__GIVE_LABELS__STEP_MOCK = utils.createMockStep(
    'Give the issue/PR the Hourly, Engineering labels',
    'Give the issue/PR the Hourly, Engineering labels',
    'DEPLOYBLOCKER',
    [],
    ['GITHUB_TOKEN'],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__POST_THE_ISSUE_IN_THE_EXPENSIFY_OPEN_SOURCE_SLACK_ROOM__STEP_MOCK = utils.createMockStep(
    'Post the issue in the #expensify-open-source slack room',
    'Post the issue in the expensify-open-source slack room',
    'DEPLOYBLOCKER',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const DEPLOYBLOCKER__DEPLOYBLOCKER__COMMENT_ON_DEPLOY_BLOCKER__STEP_MOCK = utils.createMockStep(
    'Comment on deploy blocker',
    'Comment on deploy blocker',
    'DEPLOYBLOCKER',
    [],
    ['GITHUB_TOKEN'],
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
    DEPLOYBLOCKER__DEPLOYBLOCKER__GIVE_LABELS__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__POST_THE_ISSUE_IN_THE_EXPENSIFY_OPEN_SOURCE_SLACK_ROOM__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__COMMENT_ON_DEPLOY_BLOCKER__STEP_MOCK,
    DEPLOYBLOCKER__DEPLOYBLOCKER__ANNOUNCE_FAILED_WORKFLOW_IN_SLACK__STEP_MOCK,
];

module.exports = {
    DEPLOYBLOCKER__UPDATECHECKLIST__STEP_MOCKS,
    DEPLOYBLOCKER__DEPLOYBLOCKER__STEP_MOCKS,
};
