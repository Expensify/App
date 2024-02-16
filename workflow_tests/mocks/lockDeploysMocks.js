const utils = require('../utils/utils');

// lockstagingdeploys
const LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checking out', 'LOCKSTAGINGDEPLOYS', ['ref', 'token'], []);
const LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__WAIT_FOR_STAGING_DEPLOYS_TO_FINISH__STEP_MOCK = utils.createMockStep(
    'Wait for staging deploys to finish',
    'Waiting for staging deploys to finish',
    'LOCKSTAGINGDEPLOYS',
    ['GITHUB_TOKEN'],
    [],
);
const LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__COMMENT_IN_STAGINGDEPLOYCASH_TO_GIVE_APPLAUSE_THE_GREEN_LIGHT_TO_BEGIN_QA__STEP_MOCK = utils.createMockStep(
    'Comment in StagingDeployCash to give Applause the 🟢 to begin QA',
    'Commenting in StagingDeployCash',
    'LOCKSTAGINGDEPLOYS',
    [],
    ['GITHUB_TOKEN'],
);
const LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__ANNOUNCE_FAILED_WORKFLOW__STEP_MOCK = utils.createMockStep(
    'Announce failed workflow',
    'Announcing failed workflow in Slack',
    'LOCKSTAGINGDEPLOYS',
    ['SLACK_WEBHOOK'],
    [],
);
const LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS = [
    LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__CHECKOUT__STEP_MOCK,
    LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__WAIT_FOR_STAGING_DEPLOYS_TO_FINISH__STEP_MOCK,
    LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__COMMENT_IN_STAGINGDEPLOYCASH_TO_GIVE_APPLAUSE_THE_GREEN_LIGHT_TO_BEGIN_QA__STEP_MOCK,
    LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__ANNOUNCE_FAILED_WORKFLOW__STEP_MOCK,
];

module.exports = {
    LOCKDEPLOYS__LOCKSTAGINGDEPLOYS__STEP_MOCKS,
};
