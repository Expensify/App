import {fireEvent, render, screen} from '@testing-library/react-native';

import emojis, {categoryFrequentlyUsed} from '@assets/emojis';

import CategoryShortcutBar from '@components/EmojiPicker/CategoryShortcutBar';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Tooltip from '@components/Tooltip';
import type {TooltipExtendedProps} from '@components/Tooltip/types';

import {getHeaderEmojis} from '@libs/EmojiUtils';
import Log from '@libs/Log';

import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import {defaultTheme} from '@src/styles/theme';

import React from 'react';

import {translateLocal} from '../utils/TestHelper';

jest.mock('@components/Tooltip', () => ({
    __esModule: true,
    default: jest.fn(({children}: TooltipExtendedProps) => children),
}));

const productionHeaders = getHeaderEmojis([categoryFrequentlyUsed, ...emojis]);
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

describe('CategoryShortcutBar', () => {
    const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});

    beforeEach(async () => {
        await IntlStore.load('en');
        jest.mocked(Tooltip).mockClear();
        alertSpy.mockClear();
    });

    afterAll(() => {
        alertSpy.mockRestore();
    });

    it('uses the production translation for every category tooltip and accessible label', () => {
        // Given the production headers are the source of every category shortcut.
        const onPress = jest.fn();

        // When every production category appears in the shortcut bar.
        render(
            <LocaleContextProvider>
                <CategoryShortcutBar
                    headerEmojis={productionHeaders}
                    onPress={onPress}
                />
            </LocaleContextProvider>,
        );

        // Then every header has its own translation and none takes the unmapped fallback.
        const expectedLabels = expectedTranslationPaths.map((path) => translateLocal(path));
        const tooltipLabels = jest
            .mocked(Tooltip)
            .mock.calls.slice(-productionHeaders.length)
            .map(([props]) => props.text);
        expect(tooltipLabels).toEqual(expectedLabels);
        expect(screen.getAllByRole('button')).toHaveLength(expectedLabels.length);
        for (const label of expectedLabels) {
            expect(screen.getByRole('button', {name: label})).toBeVisible();
        }
        expect(alertSpy).not.toHaveBeenCalled();
    });

    it('alerts for an unmapped category while providing the frequently-used fallback label', () => {
        // Given a future category can reach the bar before a translation is mapped.
        const unknownHeader = {...categoryFrequentlyUsed, code: 'unknownCategory', index: -1};

        // When that unmapped category is rendered.
        render(
            <LocaleContextProvider>
                <CategoryShortcutBar
                    headerEmojis={[unknownHeader]}
                    onPress={jest.fn()}
                />
            </LocaleContextProvider>,
        );

        // Then the fallback remains usable and the missing mapping cannot silently ship.
        const fallbackLabel = translateLocal('emojiPicker.headers.frequentlyUsed');
        expect(screen.getByRole('button', {name: fallbackLabel})).not.toBeSelected();
        expect(jest.mocked(Tooltip).mock.calls.at(-1)?.[0].text).toBe(fallbackLabel);
        expect(alertSpy).toHaveBeenCalledWith('No emoji category translation mapped for code: unknownCategory');
    });

    it('exposes the selected category through its accessible state', () => {
        // Given a category is selected by its production header index.
        const selectedHeader = productionHeaders.at(1);
        if (!selectedHeader) {
            throw new Error('The smileys emoji header is missing');
        }

        // When the bar receives that selected index.
        render(
            <LocaleContextProvider>
                <CategoryShortcutBar
                    headerEmojis={productionHeaders}
                    selectedIndex={selectedHeader.index}
                    onPress={jest.fn()}
                />
            </LocaleContextProvider>,
        );

        // Then assistive technology can distinguish selected and unselected shortcuts.
        expect(screen.getByRole('button', {name: translateLocal('emojiPicker.headers.smileysAndEmotion'), selected: true})).toBeSelected();
        expect(screen.getByRole('button', {name: translateLocal('emojiPicker.headers.frequentlyUsed'), selected: false})).not.toBeSelected();
    });

    it('passes the category index to the press handler', () => {
        // Given shortcut presses must select the matching category in the emoji list.
        const onPress = jest.fn();
        const header = {...categoryFrequentlyUsed, index: 42};
        render(
            <LocaleContextProvider>
                <CategoryShortcutBar
                    headerEmojis={[header]}
                    onPress={onPress}
                />
            </LocaleContextProvider>,
        );

        // When the user presses that category's shortcut.
        fireEvent.press(screen.getByRole('button', {name: translateLocal('emojiPicker.headers.frequentlyUsed')}));

        // Then the bar reports the header index rather than its position in the shortcut array.
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(onPress).toHaveBeenCalledWith(header.index);
    });

    it('highlights a shortcut only while it is hovered', () => {
        // Given a shortcut starts without hover highlighting.
        render(
            <LocaleContextProvider>
                <CategoryShortcutBar
                    headerEmojis={[{...categoryFrequentlyUsed, index: 0}]}
                    onPress={jest.fn()}
                />
            </LocaleContextProvider>,
        );
        const button = screen.getByRole('button', {name: translateLocal('emojiPicker.headers.frequentlyUsed')});
        const highlight = {backgroundColor: defaultTheme.buttonDefaultBG};
        expect(button).not.toHaveStyle(highlight);

        // When the pointer enters and then leaves the shortcut.
        fireEvent(button, 'hoverIn');
        // Then the hover style appears while the pointer is inside and clears on exit.
        expect(button).toHaveStyle(highlight);
        fireEvent(button, 'hoverOut');
        expect(button).not.toHaveStyle(highlight);
    });
});
