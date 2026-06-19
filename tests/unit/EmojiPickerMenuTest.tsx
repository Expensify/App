/**
 * Fallback option 1: tests the frequently-used dedupe logic end-to-end by calling
 * processFrequentlyUsedEmojis + mergeEmojisWithFrequentlyUsedEmojis directly rather than
 * mounting EmojiPickerMenu (which requires many providers).
 *
 * [RED] before commit 12: hexcode-only entries are filtered by the current impl, so the
 * merged list is missing one entry and the summed count is wrong.
 */
import emojis from '@assets/emojis';
import {mergeEmojisWithFrequentlyUsedEmojis, processFrequentlyUsedEmojis} from '@libs/EmojiUtils';
import type FrequentlyUsedEmoji from '@src/types/onyx/FrequentlyUsedEmoji';

describe('EmojiPickerMenu frequently used dedupe', () => {
    it('collapses mixed-format frequently used entries to one picker entry per emoji', () => {
        const frequentlyUsedEmojis: FrequentlyUsedEmoji[] = [
            {name: '+1', code: '', count: 5, lastUpdatedAt: 100},
            {name: '', code: '👍', count: 3, lastUpdatedAt: 200},
            {name: '', code: '', hexcode: '1F44D', count: 1, lastUpdatedAt: 300},
        ];

        const processed = processFrequentlyUsedEmojis(frequentlyUsedEmojis);

        expect(processed).toHaveLength(1);
        expect(processed.at(0)?.hexcode).toBe('1F44D');
        expect(processed.at(0)?.count).toBe(9);

        const merged = mergeEmojisWithFrequentlyUsedEmojis(emojis, processed);
        const frequentlyUsedSection = merged.filter((item) => !('header' in item) && !('spacer' in item) && 'count' in item);
        const thumbsUpEntries = frequentlyUsedSection.filter((item) => 'code' in item && item.code === '👍');
        expect(thumbsUpEntries).toHaveLength(1);
    });
});
