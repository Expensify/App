const utils = require('../utils/utils');

// lint
const LINT__LINT__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'LINT', [], []);
const LINT__LINT__SETUP_NODE__STEP_MOCK = utils.createMockStep('Setup Node', 'Setup Node', 'LINT', [], []);
const LINT__LINT__LINT_JAVASCRIPT_WITH_ESLINT__STEP_MOCK = utils.createMockStep('Lint JavaScript and Typescript with ESLint', 'Lint JavaScript with ESLint', 'LINT', [], ['CI']);
const LINT__LINT__LINT_SHELL_SCRIPTS_WITH_SHELLCHECK__STEP_MOCK = utils.createMockStep('Lint shell scripts with ShellCheck', 'Lint shell scripts with ShellCheck', 'LINT', [], []);
const LINT__LINT__STEP_MOCKS = [
    LINT__LINT__CHECKOUT__STEP_MOCK,
    LINT__LINT__SETUP_NODE__STEP_MOCK,
    LINT__LINT__LINT_JAVASCRIPT_WITH_ESLINT__STEP_MOCK,
    LINT__LINT__LINT_SHELL_SCRIPTS_WITH_SHELLCHECK__STEP_MOCK,
];

module.exports = {
    LINT__LINT__STEP_MOCKS,
};
