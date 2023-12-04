const utils = require('../utils/utils');

const assertLintJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'LINT', 'Checkout', [], []),
        utils.createStepAssertion('Setup Node', true, null, 'LINT', 'Setup Node', [], []),
        utils.createStepAssertion('Lint JavaScript and Typescript with ESLint', true, null, 'LINT', 'Lint JavaScript with ESLint', [], [{key: 'CI', value: 'true'}]),
        utils.createStepAssertion("Verify there's no Prettier diff", true, null, 'LINT', 'Verify theres no Prettier diff', [], []),
        utils.createStepAssertion('Run unused style searcher', true, null, 'LINT', 'Run unused style searcher', [], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertLintJobExecuted,
};
