const utils = require('../utils/utils');

// verify
const VERIFYPODFILE__VERIFY__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout',
    'Checkout',
    'VERIFY',
    ['fetch-depth'],
    [],
);
const VERIFYPODFILE__VERIFY__SETUP_NODE__STEP_MOCK = utils.getMockStep(
    'Setup Node',
    'Setup Node',
    'VERIFY',
    [],
    [],
);
const VERIFYPODFILE__VERIFY__VERIFY_PODFILE__STEP_MOCK = utils.getMockStep(
    'Verify podfile',
    'Verify podfile',
    'VERIFY',
    [],
    [],
);
const VERIFYPODFILE__VERIFY__STEP_MOCKS = [
    VERIFYPODFILE__VERIFY__CHECKOUT__STEP_MOCK,
    VERIFYPODFILE__VERIFY__SETUP_NODE__STEP_MOCK,
    VERIFYPODFILE__VERIFY__VERIFY_PODFILE__STEP_MOCK,
];

module.exports = {
    VERIFYPODFILE__VERIFY__STEP_MOCKS,
};
