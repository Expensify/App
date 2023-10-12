const utils = require('../utils/utils');

const assertVerifyJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'VERIFY', 'Checkout'),
        utils.createStepAssertion('Setup Node', true, null, 'VERIFY', 'Setup Node', [], []),
        utils.createStepAssertion('Verify podfile', true, null, 'VERIFY', 'Verify podfile', [], []),
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
