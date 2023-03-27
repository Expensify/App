const utils = require('../utils/utils');

const assertJestJobExecuted = (workflowResult, didExecute = true, timesExecuted = 3) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'JEST',
            'Checkout',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'JEST',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Get number of CPU cores',
            true,
            null,
            'JEST',
            'Get number of CPU cores',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Cache Jest cache',
            true,
            null,
            'JEST',
            'Cache Jest cache',
            [{key: 'path', value: '.jest-cache'}, {key: 'key', value: 'Linux-jest'}],
            [],
        ),
        utils.getStepAssertion(
            'Jest tests',
            true,
            null,
            'JEST',
            'Jest tests',
            [],
            [],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            let cnt = 0;
            for (const executedStep of workflowResult) {
                if (
                    executedStep.name === expectedStep.name
                    && executedStep.output === expectedStep.output
                    && executedStep.status === expectedStep.status
                ) {
                    cnt += 1;
                }
            }
            expect(cnt).toEqual(timesExecuted);
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};
const assertShellTestsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'SHELLTESTS',
            'Checkout',
            [],
            [],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'SHELLTESTS',
            'Setup Node',
            [],
            [],
        ),
        utils.getStepAssertion(
            'getPullRequestsMergedBetween',
            true,
            null,
            'SHELLTESTS',
            'getPullRequestsMergedBetween',
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
    assertJestJobExecuted, assertShellTestsJobExecuted,
};
