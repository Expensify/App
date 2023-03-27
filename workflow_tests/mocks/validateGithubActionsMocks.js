const utils = require('../utils/utils');

// verify
const VALIDATEGITHUBACTIONS__VERIFY__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout',
    'Checkout',
    'VERIFY',
    ['fetch-depth'],
    [],
);
const VALIDATEGITHUBACTIONS__VERIFY__SETUP_NODE__STEP_MOCK = utils.getMockStep(
    'Setup Node',
    'Setup Node',
    'VERIFY',
    [],
    [],
);
const VALIDATEGITHUBACTIONS__VERIFY__VERIFY_JAVASCRIPT_ACTION_BUILDS__STEP_MOCK = utils.getMockStep(
    'Verify Javascript Action Builds',
    'Verify Javascript Action Builds',
    'VERIFY',
    [],
    [],
);
const VALIDATEGITHUBACTIONS__VERIFY__VALIDATE_ACTIONS_AND_WORKFLOWS__STEP_MOCK = utils.getMockStep(
    'Validate actions and workflows',
    'Validate actions and workflows',
    'VERIFY',
    [],
    [],
);
const VALIDATEGITHUBACTIONS__VERIFY__STEP_MOCKS = [
    VALIDATEGITHUBACTIONS__VERIFY__CHECKOUT__STEP_MOCK,
    VALIDATEGITHUBACTIONS__VERIFY__SETUP_NODE__STEP_MOCK,
    VALIDATEGITHUBACTIONS__VERIFY__VERIFY_JAVASCRIPT_ACTION_BUILDS__STEP_MOCK,
    VALIDATEGITHUBACTIONS__VERIFY__VALIDATE_ACTIONS_AND_WORKFLOWS__STEP_MOCK,
];

module.exports = {
    VALIDATEGITHUBACTIONS__VERIFY__STEP_MOCKS,
};
