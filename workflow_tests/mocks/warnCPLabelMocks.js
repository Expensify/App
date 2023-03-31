const utils = require('../utils/utils');

// warncplabel
const WARNCPLABEL__WARNCPLABEL__COMMENT_ON_PR_TO_EXPLAIN_THE_CP_STAGING_LABEL__STEP_MOCK = utils.createMockStep(
    'Comment on PR to explain the CP Staging label',
    'Comment on PR to explain the CP Staging label',
    'WARNCPLABEL',
    ['github_token'],
    [],
);
const WARNCPLABEL__WARNCPLABEL__ANNOUNCE_FAILED_WORKFLOW_IN_SLACK__STEP_MOCK = utils.createMockStep(
    'Announce failed workflow in Slack',
    'Announce failed workflow in Slack',
    'WARNCPLABEL',
    ['SLACK_WEBHOOK'],
    [],
);
const WARNCPLABEL__WARNCPLABEL__STEP_MOCKS = [
    WARNCPLABEL__WARNCPLABEL__COMMENT_ON_PR_TO_EXPLAIN_THE_CP_STAGING_LABEL__STEP_MOCK,
    WARNCPLABEL__WARNCPLABEL__ANNOUNCE_FAILED_WORKFLOW_IN_SLACK__STEP_MOCK,
];

module.exports = {
    WARNCPLABEL__WARNCPLABEL__STEP_MOCKS,
};
