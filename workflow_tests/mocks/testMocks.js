const utils = require('../utils/utils');

// jest
const TEST__JEST__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout',
    'Checkout',
    'JEST',
    [],
    [],
);
const TEST__JEST__SETUP_NODE__STEP_MOCK = utils.getMockStep(
    'Setup Node',
    'Setup Node',
    'JEST',
    [],
    [],
);
const TEST__JEST__GET_NUMBER_OF_CPU_CORES__STEP_MOCK = utils.getMockStep(
    'Get number of CPU cores',
    'Get number of CPU cores',
    'JEST',
    [],
    [],
    {count: 8},
);
const TEST__JEST__CACHE_JEST_CACHE__STEP_MOCK = utils.getMockStep(
    'Cache Jest cache',
    'Cache Jest cache',
    'JEST',
    ['path', 'key'],
    [],
);
const TEST__JEST__JEST_TESTS__STEP_MOCK = utils.getMockStep(
    'Jest tests',
    'Jest tests',
    'JEST',
    [],
    [],
);
const TEST__JEST__STEP_MOCKS = [
    TEST__JEST__CHECKOUT__STEP_MOCK,
    TEST__JEST__SETUP_NODE__STEP_MOCK,
    TEST__JEST__GET_NUMBER_OF_CPU_CORES__STEP_MOCK,
    TEST__JEST__CACHE_JEST_CACHE__STEP_MOCK,
    TEST__JEST__JEST_TESTS__STEP_MOCK,
];

// shelltests
const TEST__SHELLTESTS__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout',
    'Checkout',
    'SHELLTESTS',
    [],
    [],
);
const TEST__SHELLTESTS__SETUP_NODE__STEP_MOCK = utils.getMockStep(
    'Setup Node',
    'Setup Node',
    'SHELLTESTS',
    [],
    [],
);
const TEST__SHELLTESTS__GETPULLREQUESTSMERGEDBETWEEN__STEP_MOCK = utils.getMockStep(
    'getPullRequestsMergedBetween',
    'getPullRequestsMergedBetween',
    'SHELLTESTS',
    [],
    [],
);
const TEST__SHELLTESTS__STEP_MOCKS = [
    TEST__SHELLTESTS__CHECKOUT__STEP_MOCK,
    TEST__SHELLTESTS__SETUP_NODE__STEP_MOCK,
    TEST__SHELLTESTS__GETPULLREQUESTSMERGEDBETWEEN__STEP_MOCK,
];

module.exports = {
    TEST__JEST__STEP_MOCKS, TEST__SHELLTESTS__STEP_MOCKS,
};
