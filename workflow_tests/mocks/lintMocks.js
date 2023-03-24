const utils = require('../utils/utils');

// lint
const LINT__LINT__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout',
    'Checkout',
    'LINT',
    [],
    [],
);
const LINT__LINT__SETUP_NODE__STEP_MOCK = utils.getMockStep(
    'Setup Node',
    'Setup Node',
    'LINT',
    [],
    [],
);
const LINT__LINT__LINT_JAVASCRIPT_WITH_ESLINT__STEP_MOCK = utils.getMockStep(
    'Lint JavaScript with ESLint',
    'Lint JavaScript with ESLint',
    'LINT',
    [],
    ['CI'],
);
const LINT__LINT__LINT_SHELL_SCRIPTS_WITH_SHELLCHECK__STEP_MOCK = utils.getMockStep(
    'Lint shell scripts with ShellCheck',
    'Lint shell scripts with ShellCheck',
    'LINT',
    [],
    [],
);
const LINT__LINT__STEP_MOCKS = [
    LINT__LINT__CHECKOUT__STEP_MOCK,
    LINT__LINT__SETUP_NODE__STEP_MOCK,
    LINT__LINT__LINT_JAVASCRIPT_WITH_ESLINT__STEP_MOCK,
    LINT__LINT__LINT_SHELL_SCRIPTS_WITH_SHELLCHECK__STEP_MOCK,
];

module.exports = {
    LINT__LINT__STEP_MOCKS,
};
