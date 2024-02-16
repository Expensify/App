const utils = require('../utils/utils');

const assertVerifyJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'VERIFY', 'Checkout'),
        utils.createStepAssertion('Setup Node', true, null, 'VERIFY', 'Setup Node', [], []),
        utils.createStepAssertion('Verify Javascript Action Builds', true, null, 'VERIFY', 'Verify Javascript Action Builds', [], []),
        utils.createStepAssertion('Validate actions and workflows', true, null, 'VERIFY', 'Validate actions and workflows', [], []),
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
    assertVerifyJobExecuted,
};
