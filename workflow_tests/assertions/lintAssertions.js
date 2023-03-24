const utils = require('../utils/utils');

const assertLintJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'LINT',
            'Checkout',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'LINT',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Lint JavaScript with ESLint',
            true,
            null,
            'LINT',
            'Lint JavaScript with ESLint',
            [],
            [{key: 'CI', value: 'true'}],
        ),
        utils.getStepAssertion(
            'Lint shell scripts with ShellCheck',
            true,
            null,
            'LINT',
            'Lint shell scripts with ShellCheck',
            [],
            [],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};

module.exports = {
    assertLintJobExecuted,
};
