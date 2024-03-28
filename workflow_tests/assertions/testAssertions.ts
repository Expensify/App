import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertJestJobExecuted(workflowResult: Step[], didExecute = true, timesExecuted = 3) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'JEST', 'Checkout', [], []),
        createStepAssertion('Setup Node', true, null, 'JEST', 'Setup Node', [], []),
        createStepAssertion('Get number of CPU cores', true, null, 'JEST', 'Get number of CPU cores', [], []),
        createStepAssertion(
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
        createStepAssertion('Jest tests', true, null, 'JEST', 'Jest tests', [], []),
    ] as const;

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
}

function assertShellTestsJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'SHELLTESTS', 'Checkout', [], []),
        createStepAssertion('Setup Node', true, null, 'SHELLTESTS', 'Setup Node', [], []),
        createStepAssertion('Test CI git logic', true, null, 'SHELLTESTS', 'Test CI git logic', [], []),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {assertJestJobExecuted, assertShellTestsJobExecuted};
