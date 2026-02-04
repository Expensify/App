import {isTagMissing, splitTag, trimTag} from '@libs/TagUtils';
import CONST from '@src/CONST';

describe('TagUtils', () => {
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

    describe('splitTag', () => {
        it('splits simple tag by colon', () => {
            expect(splitTag('tag1:tag2:tag3')).toEqual(['tag1', 'tag2', 'tag3']);
        });

        it('does not split escaped colons', () => {
            expect(splitTag('tag1\\:name:tag2')).toEqual(['tag1\\:name', 'tag2']);
            expect(splitTag('tag1\\\\:name:tag2')).toEqual(['tag1\\\\:name', 'tag2']);
        });

        it('handles multiple escaped colons', () => {
            expect(splitTag('a\\:b\\:c:d')).toEqual(['a\\:b\\:c', 'd']);
        });

        it('returns single element for tag without colons', () => {
            expect(splitTag('single tag')).toEqual(['single tag']);
        });

        it('returns empty strings for consecutive colons', () => {
            expect(splitTag('tag1::tag2')).toEqual(['tag1', '', 'tag2']);
        });

        it('returns empty array for empty string', () => {
            expect(splitTag('')).toEqual(['']);
        });
    });

    describe('trimTag', () => {
        it('removes a single trailing colon', () => {
            expect(trimTag('tag:')).toBe('tag');
        });

        it('removes multiple trailing colons', () => {
            expect(trimTag('tag:::')).toBe('tag');
        });

        it('does not change string without trailing colon', () => {
            expect(trimTag('tag')).toBe('tag');
        });

        it('does not remove internal colons', () => {
            expect(trimTag('a:b:c')).toBe('a:b:c');
        });

        it('removes only the trailing colons while keeping internal ones', () => {
            expect(trimTag('a:b:')).toBe('a:b');
        });

        it('returns empty string when input is empty', () => {
            expect(trimTag('')).toBe('');
        });

        it('returns empty string when input is only colons', () => {
            expect(trimTag('::::')).toBe('');
        });
    });
});
