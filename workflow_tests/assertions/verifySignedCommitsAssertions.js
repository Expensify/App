const utils = require('../utils/utils');

const assertVerifySignedCommitsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Verify signed commits',
            true,
            null,
            'VERIFYSIGNEDCOMMITS',
            'Verify signed commits',
            [{key: 'GITHUB_TOKEN', value: '***'}],
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
    assertVerifySignedCommitsJobExecuted,
};
