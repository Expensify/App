import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertLintJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'LINT', 'Checkout', [], []),
        createStepAssertion('Setup Node', true, null, 'LINT', 'Setup Node', [], []),
        createStepAssertion('Lint JavaScript and Typescript with ESLint', true, null, 'LINT', 'Lint JavaScript with ESLint', [], [{key: 'CI', value: 'true'}]),
        createStepAssertion("Verify there's no Prettier diff", true, null, 'LINT', 'Verify theres no Prettier diff', [], []),
        createStepAssertion('Run unused style searcher', true, null, 'LINT', 'Run unused style searcher', [], []),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {assertLintJobExecuted};
