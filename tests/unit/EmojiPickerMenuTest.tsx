import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

/**
 * Fallback option 1: tests the frequently-used dedupe logic end-to-end by calling
 * processFrequentlyUsedEmojis + mergeEmojisWithFrequentlyUsedEmojis directly rather than
 * mounting EmojiPickerMenu (which requires many providers).
 *
 * [RED] before commit 12: hexcode-only entries are filtered by the current impl, so the
 * merged list is missing one entry and the summed count is wrong.
 */
import emojis, {categoryFrequentlyUsed} from '@assets/emojis';

import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Tooltip from '@components/Tooltip';
import type {TooltipExtendedProps} from '@components/Tooltip/types';

import {getHeaderEmojis, mergeEmojisWithFrequentlyUsedEmojis, processFrequentlyUsedEmojis} from '@libs/EmojiUtils';

import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import type FrequentlyUsedEmoji from '@src/types/onyx/FrequentlyUsedEmoji';

import React from 'react';

import {translateLocal} from '../utils/TestHelper';

jest.mock('@components/Tooltip', () => ({
    __esModule: true,
    default: jest.fn(({children}: TooltipExtendedProps) => children),
}));

describe('CategoryShortcutBar labels', () => {
    it('uses production labels for every header and the frequently-used fallback for an unknown code', async () => {
        await IntlStore.load('en');
        const onPress = jest.fn();
        const productionHeaders = getHeaderEmojis([categoryFrequentlyUsed, ...emojis]);
        expect(productionHeaders.map(({code}) => code)).toEqual([
            'frequentlyUsed',
            'smileysAndEmotion',
            'animalsAndNature',
            'foodAndDrink',
            'travelAndPlaces',
            'activities',
            'objects',
            'symbols',
            'flags',
        ]);
        const frequentlyUsedHeader = productionHeaders.at(0);
        expect(frequentlyUsedHeader).toBeDefined();
        if (!frequentlyUsedHeader) {
            throw new Error('The frequently-used emoji header is missing');
        }
        const headerEmojis = [...productionHeaders, {...frequentlyUsedHeader, code: 'unknownCategory', index: -1}];
        const expectedTranslationPaths: TranslationPaths[] = [
            'emojiPicker.headers.frequentlyUsed',
            'emojiPicker.headers.smileysAndEmotion',
            'emojiPicker.headers.animalsAndNature',
            'emojiPicker.headers.foodAndDrink',
            'emojiPicker.headers.travelAndPlaces',
            'emojiPicker.headers.activities',
            'emojiPicker.headers.objects',
            'emojiPicker.headers.symbols',
            'emojiPicker.headers.flags',
        ];
        const selectedHeader = productionHeaders.at(1);
        expect(selectedHeader).toBeDefined();
        if (!selectedHeader) {
            throw new Error('The smileys emoji header is missing');
        }

        jest.mocked(Tooltip).mockClear();
        render(
            <LocaleContextProvider>
                <CategoryShortcutBar
                    headerEmojis={headerEmojis}
                    selectedIndex={selectedHeader.index}
                    onPress={onPress}
                />
            </LocaleContextProvider>,
        );

        for (const translationPath of expectedTranslationPaths) {
            const label = translateLocal(translationPath);
            const expectedCount = translationPath === 'emojiPicker.headers.frequentlyUsed' ? 2 : 1;
            await waitFor(() => {
                const tooltipLabels = jest
                    .mocked(Tooltip)
                    .mock.calls.slice(-headerEmojis.length)
                    .map(([tooltipProps]) => tooltipProps.text);
                expect(tooltipLabels.filter((tooltipLabel) => tooltipLabel === label)).toHaveLength(expectedCount);
                expect(screen.getAllByLabelText(label)).toHaveLength(expectedCount);
            });
        }

        const frequentlyUsedButtons = screen.getAllByLabelText(translateLocal('emojiPicker.headers.frequentlyUsed'));
        expect(frequentlyUsedButtons.at(-1)?.props.accessibilityState).toMatchObject({disabled: false, selected: undefined});

        const selectedButton = screen.getByLabelText(translateLocal('emojiPicker.headers.smileysAndEmotion'));
        expect(selectedButton.props.accessibilityState).toMatchObject({disabled: false, selected: true});
        fireEvent(selectedButton, 'hoverIn');
        fireEvent(selectedButton, 'hoverOut');
        fireEvent.press(selectedButton);
        expect(onPress).toHaveBeenCalledWith(selectedHeader.index);
    });
});

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
