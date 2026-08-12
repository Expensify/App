/**
 * @jest-environment node
 */
import {isDuplicateCheckResponse} from '@prompts/proposalPolice/schema';

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
