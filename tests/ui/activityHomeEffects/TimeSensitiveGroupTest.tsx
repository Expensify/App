/**
 * Cover/reveal contract of the "Time sensitive" group's collapse effect once the Home tab sits under
 * `ScreenActivityWrapper`.
 *
 * The group collapses itself in the cleanup of a `useFocusEffect`, so leaving Home and coming back always shows the
 * first five items again. A cover runs that same cleanup, which is what makes the wrapper invisible to the user here:
 * the state the reveal shows is the state a tab blur leaves behind today, and the toggle keeps working afterwards.
 */
import {fireEvent, screen} from '@testing-library/react-native';

import TimeSensitiveGroup from '@pages/home/TimeSensitiveSection/TimeSensitiveGroup';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';
import type {EffectCallback} from 'react';

import React from 'react';
import {View} from 'react-native';

import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

// On a focused screen react-navigation runs the focus callback as an effect and its cleanup on blur, so an effect is
// the same lifecycle with the cover left as the only thing that can end it.
jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    const ReactModule = jest.requireActual<typeof React>('react');

    return {
        ...actualNavigation,
        useFocusEffect: (callback: EffectCallback) => ReactModule.useEffect(callback, [callback]),
    };
});

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useTheme', () => jest.fn(() => ({text: '#000000', icon: '#888888'})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => jest.fn(() => ({})),
                },
            ),
    ),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({DownArrow: null, UpArrow: null})),
}));

const ITEM_COUNT = CONST.HOME.SECTION_VISIBLE_LIMIT + 1;

const items = Array.from({length: ITEM_COUNT}, (element, index) => (
    <View
        key={index}
        testID={`time-sensitive-item-${index}`}
    />
));

function visibleItemCount(): number {
    return screen.queryAllByTestId(/^time-sensitive-item-/).length;
}

function pressExpandToggle() {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));
}

describe('TimeSensitiveGroup under a screen cover', () => {
    it('shows only the first page of items until the toggle is pressed', () => {
        renderScreenWithCover(<TimeSensitiveGroup items={items} />);

        expect(visibleItemCount()).toBe(CONST.HOME.SECTION_VISIBLE_LIMIT);

        pressExpandToggle();

        expect(visibleItemCount()).toBe(ITEM_COUNT);
    });

    it('collapses an expanded group on a hide, the way a blur collapses it', async () => {
        const home = renderScreenWithCover(<TimeSensitiveGroup items={items} />);
        pressExpandToggle();
        expect(visibleItemCount()).toBe(ITEM_COUNT);

        await home.hide();
        await home.reveal();

        // Under `none` the cover is not a blur and nothing runs the cleanup, which is the difference the wrapper makes:
        // it turns a cover into the collapse the user already gets from leaving the tab.
        const expectedItemCount = getCoverMode() === 'activity' ? CONST.HOME.SECTION_VISIBLE_LIMIT : ITEM_COUNT;
        expect(visibleItemCount()).toBe(expectedItemCount);
    });

    it('leaves a collapsed group collapsed across a hide and a reveal', async () => {
        const home = renderScreenWithCover(<TimeSensitiveGroup items={items} />);

        await home.hide();
        await home.reveal();

        expect(visibleItemCount()).toBe(CONST.HOME.SECTION_VISIBLE_LIMIT);
    });

    it('keeps the toggle working after a reveal', async () => {
        const home = renderScreenWithCover(<TimeSensitiveGroup items={items} />);

        await home.hide();
        await home.reveal();
        pressExpandToggle();

        expect(visibleItemCount()).toBe(ITEM_COUNT);
    });
});
