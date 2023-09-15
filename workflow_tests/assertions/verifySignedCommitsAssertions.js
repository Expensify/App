const utils = require('../utils/utils');

const assertVerifySignedCommitsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Verify signed commits', true, null, 'VERIFYSIGNEDCOMMITS', 'Verify signed commits', [{key: 'GITHUB_TOKEN', value: '***'}], [])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertVerifySignedCommitsJobExecuted,
};
