const utils = require('../utils/utils');

const assertVerifyJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout',
            true,
            null,
            'VERIFY',
            'Checkout',
            [{key: 'fetch-depth', value: '0'}],
            [],
        ),
        utils.createStepAssertion(
            'Setup Node',
            true,
            null,
            'VERIFY',
            'Setup Node',
            [],
            [],
        ),
        utils.createStepAssertion(
            'Verify podfile',
            true,
            null,
            'VERIFY',
            'Verify podfile',
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
    assertVerifyJobExecuted,
};
