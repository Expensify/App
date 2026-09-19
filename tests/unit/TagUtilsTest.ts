import {getDecodedTagName, getTagNameError, isTagMissing, trimTag} from '@libs/TagUtils';

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

    describe('getTagNameError', () => {
        const encodedResearchAndDevelopment = 'R&amp;D';
        const tags = {
            Engineering: {name: 'Engineering', enabled: true},
            [encodedResearchAndDevelopment]: {name: encodedResearchAndDevelopment, enabled: true},
        };

        it('does not flag an HTML-encoded tag as a duplicate of its decoded name', () => {
            expect(getTagNameError(tags, 'R&D', 'R&D')).toBeUndefined();
        });

        it('flags a decoded name that already exists as an encoded tag', () => {
            expect(getTagNameError(tags, 'R&D')).toBe('existing');
            expect(getTagNameError(tags, 'R&D', 'Engineering')).toBe('existing');
        });

        it('returns tooLong when a colon pushes the escaped stored name over the limit', () => {
            // Given a 255-character name with one colon. Persistence turns `:` into `\:`, so the stored name is 256 characters.
            const nameWithColon = `${'a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH - 1)}:`;

            // When we validate the name for create, edit, or inline
            const error = getTagNameError(undefined, nameWithColon);

            // Then it is too long because expense submit rejects stored tags over the API max
            expect(error).toBe('tooLong');
        });

        it('accepts a name at the limit when escaping does not add characters', () => {
            // Given a 255-character name with no colons, so the stored name stays 255 characters
            const name = 'a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH);

            // When we validate it
            const error = getTagNameError(undefined, name);

            // Then it is accepted
            expect(error).toBeUndefined();
        });

        it('accepts a name with a colon when the escaped length is still within the limit', () => {
            // Given 254 characters including one colon, which stores as 255 characters
            const nameWithColon = `${'a'.repeat(CONST.API_TRANSACTION_TAG_MAX_LENGTH - 2)}:`;

            // When we validate it
            const error = getTagNameError(undefined, nameWithColon);

            // Then it is accepted because the persisted name is not over the API max
            expect(error).toBeUndefined();
        });
    });
});
