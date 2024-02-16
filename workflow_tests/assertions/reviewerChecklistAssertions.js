const utils = require('../utils/utils');

const assertChecklistJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('reviewerChecklist.js', true, null, 'CHECKLIST', 'reviewerChecklist.js', [{key: 'GITHUB_TOKEN', value: '***'}], [])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertChecklistJobExecuted,
};
