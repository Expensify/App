import {beforeEach, describe, expect, it, jest} from 'bun:test';

import run from '@github/actions/javascript/checkExplanationVerbosity/checkExplanationVerbosity';

import * as core from '@actions/core';
import {context} from '@actions/github';

const mockSetOutput = jest.spyOn(core, 'setOutput').mockImplementation(() => {});

function setPullRequestContext(body: string, additions: number, deletions: number) {
    // `context` is a plain mutable object (see tests/tooling/getPullRequestIncrementalChanges.test.ts), so fields
    // this action reads can be assigned directly without mocking the @actions/github module.
    context.payload = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_request: {body, additions, deletions},
    };
}

const explanation = (wordCount: number) => `### Explanation of Change\n${'word '.repeat(wordCount).trim()}\n### Fixed Issues\n$ https://github.com/Expensify/App/issues/1`;

describe('checkExplanationVerbosity action tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not flag a short explanation on a mostly-deletion diff', () => {
        setPullRequestContext(explanation(20), 5, 500);

        run();

        expect(mockSetOutput).toHaveBeenCalledWith('SHOULD_COMMENT', false);
        expect(mockSetOutput).toHaveBeenCalledWith('WORD_COUNT', 20);
    });

    it('does not flag a long explanation on a mostly-addition diff', () => {
        setPullRequestContext(explanation(900), 500, 5);

        run();

        expect(mockSetOutput).toHaveBeenCalledWith('SHOULD_COMMENT', false);
        expect(mockSetOutput).toHaveBeenCalledWith('WORD_COUNT', 900);
    });

    it('flags a long explanation on a mostly-deletion diff', () => {
        setPullRequestContext(explanation(900), 5, 500);

        run();

        expect(mockSetOutput).toHaveBeenCalledWith('SHOULD_COMMENT', true);
        expect(mockSetOutput).toHaveBeenCalledWith('WORD_COUNT', 900);
        expect(mockSetOutput).toHaveBeenCalledWith('DELETION_RATIO', '0.99');
    });

    it('ignores HTML comments and content outside the Explanation of Change section', () => {
        const body = `### Explanation of Change\n<!-- Explain what your change does and how it addresses the linked issue -->\nShort answer.\n### Fixed Issues\n${'word '.repeat(900)}`;
        setPullRequestContext(body, 5, 500);

        run();

        expect(mockSetOutput).toHaveBeenCalledWith('SHOULD_COMMENT', false);
        expect(mockSetOutput).toHaveBeenCalledWith('WORD_COUNT', 2);
    });

    it('handles a missing PR body without throwing', () => {
        setPullRequestContext('', 0, 0);

        run();

        expect(mockSetOutput).toHaveBeenCalledWith('SHOULD_COMMENT', false);
        expect(mockSetOutput).toHaveBeenCalledWith('WORD_COUNT', 0);
        expect(mockSetOutput).toHaveBeenCalledWith('DELETION_RATIO', '0.00');
    });
});
