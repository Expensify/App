import isTagMissing from '@libs/TagUtils';
import CONST from '@src/CONST';

describe('isTagMissing', () => {
    it('returns true if tag is undefined', () => {
        expect(isTagMissing(undefined)).toBe(true);
    });

    it('returns true if tag is an empty string', () => {
        expect(isTagMissing('')).toBe(true);
    });

    it('returns true if tag equals TAG_EMPTY_VALUE', () => {
        expect(isTagMissing(CONST.SEARCH.TAG_EMPTY_VALUE)).toBe(true);
    });

    it('returns false if tag is a valid string', () => {
        expect(isTagMissing('Project A')).toBe(false);
        expect(isTagMissing('Department')).toBe(false);
        expect(isTagMissing('Client Work')).toBe(false);
    });

    it('returns false for strings that look like but are not TAG_EMPTY_VALUE', () => {
        expect(isTagMissing('None')).toBe(false);
        expect(isTagMissing('NONE')).toBe(false);
        expect(isTagMissing(' none')).toBe(false);
        expect(isTagMissing('none ')).toBe(false);
    });
});
