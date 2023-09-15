const utils = require('../utils/utils');

const assertJestJobExecuted = (workflowResult, didExecute = true, timesExecuted = 3) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'JEST', 'Checkout', [], []),
        utils.createStepAssertion('Setup Node', true, null, 'JEST', 'Setup Node', [], []),
        utils.createStepAssertion('Get number of CPU cores', true, null, 'JEST', 'Get number of CPU cores', [], []),
        utils.createStepAssertion(
            'Cache Jest cache',
            true,
            null,
            'JEST',
            'Cache Jest cache',
            [
                {key: 'path', value: '.jest-cache'},
                {key: 'key', value: 'Linux-jest'},
            ],
            [],
        ),
        utils.createStepAssertion('Jest tests', true, null, 'JEST', 'Jest tests', [], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            let cnt = 0;
            workflowResult.forEach((executedStep) => {
                if (executedStep.name !== expectedStep.name || executedStep.output !== expectedStep.output || executedStep.status !== expectedStep.status) {
                    return;
                }
                cnt += 1;
            });
            expect(cnt).toEqual(timesExecuted);
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};
const assertShellTestsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'SHELLTESTS', 'Checkout', [], []),
        utils.createStepAssertion('Setup Node', true, null, 'SHELLTESTS', 'Setup Node', [], []),
        utils.createStepAssertion('Test CI git logic', true, null, 'SHELLTESTS', 'Test CI git logic', [], []),
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
    assertJestJobExecuted,
    assertShellTestsJobExecuted,
};
