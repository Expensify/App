import {getDecodedTagName, hasAnyTagGLCode, isTagMissing, trimTag} from '@libs/TagUtils';
import CONST from '@src/CONST';
import type {PolicyTag, PolicyTagList, PolicyTags} from '@src/types/onyx/PolicyTag';

function buildTagList(name: string, tags: PolicyTags): PolicyTagList {
    return {name, required: false, orderWeight: 0, tags};
}

function buildTag(name: string, glCode?: string): PolicyTag {
    return {
        name,
        enabled: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...(glCode === undefined ? {} : {'GL Code': glCode}),
    };
}

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

        it('returns false for tag with colons', () => {
            expect(isTagMissing('tag:with:colons')).toBe(false);
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

        it('handles escaped colons correctly', () => {
            expect(trimTag('tag\\:name:')).toBe('tag\\:name');
            expect(trimTag('tag\\:name\\:')).toBe('tag\\:name\\:');
            expect(trimTag('tag\\:name\\\\::')).toBe('tag\\:name\\\\:');
        });
    });

    describe('getDecodedTagName', () => {
        it('decodes &amp; to &', () => {
            expect(getDecodedTagName('R&amp;D')).toBe('R&D');
        });

        it('returns an unencoded string unchanged', () => {
            expect(getDecodedTagName('R&D')).toBe('R&D');
        });

        it('returns an empty string when input is empty', () => {
            expect(getDecodedTagName('')).toBe('');
        });

        it('decodes other common HTML entities', () => {
            expect(getDecodedTagName('a &lt; b &gt; c')).toBe('a < b > c');
            expect(getDecodedTagName('&quot;hello&quot;')).toBe('"hello"');
        });
    });

    describe('hasAnyTagGLCode', () => {
        it('returns false when no tag has a GL Code', () => {
            const tagLists = [
                buildTagList('Region', {California: buildTag('California'), Texas: buildTag('Texas')}),
                buildTagList('City', {SanFrancisco: buildTag('San Francisco'), Austin: buildTag('Austin')}),
            ];
            expect(hasAnyTagGLCode(tagLists)).toBe(false);
        });

        it('returns true when at least one tag has a non-empty GL Code', () => {
            const tagLists = [
                buildTagList('Region', {California: buildTag('California'), Texas: buildTag('Texas', '4000')}),
                buildTagList('City', {SanFrancisco: buildTag('San Francisco')}),
            ];
            expect(hasAnyTagGLCode(tagLists)).toBe(true);
        });

        it('ignores empty-string GL Codes', () => {
            const tagLists = [buildTagList('Region', {California: buildTag('California', ''), Texas: buildTag('Texas', '')})];
            expect(hasAnyTagGLCode(tagLists)).toBe(false);
        });

        it('returns false for empty or tag-less lists', () => {
            expect(hasAnyTagGLCode([])).toBe(false);
            expect(hasAnyTagGLCode([buildTagList('Region', {})])).toBe(false);
        });
    });
});
