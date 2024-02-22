const utils = require('../utils/utils');

const assertNotifyFailureJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Fetch Workflow Run Jobs', true, null, 'NOTIFYFAILURE', 'Fetch Workflow Run Jobs', [], []),
        utils.createStepAssertion('Process Each Failed Job', true, null, 'NOTIFYFAILURE', 'Process Each Failed Job', [], []),
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
    assertNotifyFailureJobExecuted,
};
