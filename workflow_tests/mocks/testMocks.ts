/* eslint-disable @typescript-eslint/naming-convention */
import {createMockStep} from '../utils/utils';

// jest
const TEST__JEST__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checkout', 'JEST', [], []);
const TEST__JEST__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setup Node', 'JEST', [], []);
const TEST__JEST__GET_NUMBER_OF_CPU_CORES__STEP_MOCK = createMockStep('Get number of CPU cores', 'Get number of CPU cores', 'JEST', [], [], {count: 8});
const TEST__JEST__CACHE_JEST_CACHE__STEP_MOCK = createMockStep('Cache Jest cache', 'Cache Jest cache', 'JEST', ['path', 'key'], []);
const TEST__JEST__JEST_TESTS__STEP_MOCK = createMockStep('Jest tests', 'Jest tests', 'JEST', [], []);
const TEST__JEST__STEP_MOCKS = [
    TEST__JEST__CHECKOUT__STEP_MOCK,
    TEST__JEST__SETUP_NODE__STEP_MOCK,
    TEST__JEST__GET_NUMBER_OF_CPU_CORES__STEP_MOCK,
    TEST__JEST__CACHE_JEST_CACHE__STEP_MOCK,
    TEST__JEST__JEST_TESTS__STEP_MOCK,
];

// shelltests
const TEST__SHELLTESTS__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checkout', 'SHELLTESTS', [], []);
const TEST__SHELLTESTS__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setup Node', 'SHELLTESTS', [], []);
const TEST__SHELLTESTS__TEST_CI_GIT_LOGIC__STEP_MOCK = createMockStep('Test CI git logic', 'Test CI git logic', 'SHELLTESTS', [], []);
const TEST__SHELLTESTS__STEP_MOCKS = [TEST__SHELLTESTS__CHECKOUT__STEP_MOCK, TEST__SHELLTESTS__SETUP_NODE__STEP_MOCK, TEST__SHELLTESTS__TEST_CI_GIT_LOGIC__STEP_MOCK];

export default {TEST__JEST__STEP_MOCKS, TEST__SHELLTESTS__STEP_MOCKS};
