import {describe, expect, it} from 'bun:test';

import {isCommentIntentResponse, isDuplicateCheckResponse} from '@prompts/proposalPolice/schema';

describe('isCommentIntentResponse', () => {
    it('accepts each of the three intents', () => {
        expect(isCommentIntentResponse({intent: 'NOT_AN_ATTEMPT'})).toBe(true);
        expect(isCommentIntentResponse({intent: 'GENUINE_ATTEMPT'})).toBe(true);
        expect(isCommentIntentResponse({intent: 'SPAM'})).toBe(true);
    });

    it('rejects anything else, so an unrecognized intent degrades to leaving the comment alone', () => {
        expect(isCommentIntentResponse({intent: 'ACTION_REQUIRED'})).toBe(false);
        expect(isCommentIntentResponse({intent: 'spam'})).toBe(false);
        expect(isCommentIntentResponse({action: 'SPAM'})).toBe(false);
        expect(isCommentIntentResponse(null)).toBe(false);
    });
});

describe('isDuplicateCheckResponse', () => {
    it('accepts a well-formed duplicate result', () => {
        expect(isDuplicateCheckResponse({similarity: 95, duplicateCommentID: 42})).toBe(true);
    });

    it('accepts the scale boundaries, with no match reported as null', () => {
        expect(isDuplicateCheckResponse({similarity: 0, duplicateCommentID: null})).toBe(true);
        expect(isDuplicateCheckResponse({similarity: 100, duplicateCommentID: 1})).toBe(true);
    });

    it('rejects a similarity rescaled to 0-1, rather than reading it as "not a duplicate"', () => {
        // 0.95 sits inside 0-100, so only the integer requirement distinguishes it from a genuine low score
        expect(isDuplicateCheckResponse({similarity: 0.95, duplicateCommentID: 42})).toBe(false);
    });

    it('rejects a similarity outside the declared scale', () => {
        expect(isDuplicateCheckResponse({similarity: -1, duplicateCommentID: null})).toBe(false);
        expect(isDuplicateCheckResponse({similarity: 101, duplicateCommentID: 1})).toBe(false);
    });

    it('rejects missing or wrongly typed fields', () => {
        expect(isDuplicateCheckResponse({duplicateCommentID: 1})).toBe(false);
        expect(isDuplicateCheckResponse({similarity: '95', duplicateCommentID: 1})).toBe(false);
        expect(isDuplicateCheckResponse({similarity: 95, duplicateCommentID: 'x'})).toBe(false);
        expect(isDuplicateCheckResponse(null)).toBe(false);
    });
});
