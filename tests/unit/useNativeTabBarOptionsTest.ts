import {act, renderHook} from '@testing-library/react-native';

import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import useAndroidNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.android';
import useIOSNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.ios';
import type NativeTabBarOptionsParams from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockEmojiCode: string | undefined;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, status: mockEmojiCode ? {emojiCode: mockEmojiCode} : undefined}),
}));

const mockFontManager = {registerFont: jest.fn()};

// The global mock leaves out Skia's imperative API, which loads the custom emoji font.
jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Data: {fromURI: jest.fn(() => Promise.resolve({dispose: jest.fn()}))},
        Typeface: {MakeFreeTypeFaceFromData: jest.fn(() => ({}))},
        TypefaceFontProvider: {Make: jest.fn(() => mockFontManager)},
    },
}));

const mockGetTabBarIcon = jest.mocked(getTabBarIcon);

const PARAMS: NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: true,
    isTabBarVertical: false,
    isAccountAvatarShown: true,
    dotColors: {},
    tabLabels: {
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'Inbox',
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: 'Account',
    },
};

/** The emoji status each selection state of a tab's icon is drawn with. */
function getDrawnEmojiStatuses() {
    const getParams = mockGetTabBarIcon.mock.calls.at(-1)?.at(1);
    if (typeof getParams !== 'function') {
        return [];
    }
    return [getParams(false).emojiStatus, getParams(true).emojiStatus];
}

/** The emoji each selection state of a tab's icon is drawn with. */
function getDrawnEmojis(): Array<string | undefined> {
    return getDrawnEmojiStatuses().map((emojiStatus) => emojiStatus?.emoji);
}

describe.each([
    ['Android', useAndroidNativeTabBarOptions, 0],
    ['iOS', useIOSNativeTabBarOptions, variables.nativeTabIconEmojiStatusOffset],
])('%s useNativeTabBarOptions', (_platform, useNativeTabBarOptions, expectedEmojiStatusOffset) => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockEmojiCode = undefined;
        mockGetTabBarIcon.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('draws the status emoji on the account tab in both selection states', () => {
        // Given a user with a status emoji
        mockEmojiCode = '🌴';
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));

        // When the account tab's icon is drawn
        result.current.getTabOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        // Then the emoji is badged on it whether or not the tab is selected, as the JS tab bar does
        expect(getDrawnEmojis()).toEqual(['🌴', '🌴']);
    });

    it('leaves the status emoji off every other tab', () => {
        // Given a user with a status emoji
        mockEmojiCode = '🌴';
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));

        // When another tab's icon is drawn
        result.current.getTabOptions(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

        // Then it has no badge, because the status belongs to the account avatar
        expect(getDrawnEmojis()).toEqual([undefined, undefined]);
    });

    it('draws no badge once the status is cleared', () => {
        // Given a user whose status emoji was set and then cleared
        mockEmojiCode = '🌴';
        const {result, rerender} = renderHook(() => useNativeTabBarOptions(PARAMS));
        mockEmojiCode = undefined;
        rerender({});

        // When the account tab's icon is drawn again
        result.current.getTabOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        // Then the badge is gone, so the icon goes back to the plain avatar
        expect(getDrawnEmojis()).toEqual([undefined, undefined]);
    });

    it('draws no badge while acting as a delegate', async () => {
        // Given a user with a status emoji who is acting as a delegate
        mockEmojiCode = '🌴';
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'delegate@example.com'}});
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));
        await waitForBatchedUpdatesWithAct();

        // When the account tab's icon is drawn
        result.current.getTabOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        // Then it has no badge, because the JS tab bar shows the delegate avatar there instead of the status
        expect(getDrawnEmojis()).toEqual([undefined, undefined]);
    });

    it('draws a custom emoji with the custom emoji font once it loads', async () => {
        // Given a user whose status is a custom emoji, which the system fonts have no glyph for
        mockEmojiCode = CONST.CUSTOM_EMOJIS.GLOBAL_CREATE;
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));

        // When the account tab's icon is drawn after the font has loaded
        await act(async () => {
            await Promise.resolve();
        });
        result.current.getTabOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        // Then the badge is drawn with the custom emoji font, so it does not show a blank box
        expect(getDrawnEmojiStatuses().map((emojiStatus) => emojiStatus?.fontManager)).toEqual([mockFontManager, mockFontManager]);
    });

    it('draws a standard emoji with the system fonts', () => {
        // Given a user whose status is a standard emoji
        mockEmojiCode = '🌴';
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));

        // When the account tab's icon is drawn
        result.current.getTabOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        // Then no custom font is given, so the system's color emoji font draws it
        expect(getDrawnEmojiStatuses().map((emojiStatus) => emojiStatus?.fontManager)).toEqual([undefined, undefined]);
    });

    it('hangs the badge past the avatar only where the icon can grow', () => {
        // Given a user with a status emoji
        mockEmojiCode = '🌴';
        const {result} = renderHook(() => useNativeTabBarOptions(PARAMS));

        // When the account tab's icon is drawn
        result.current.getTabOptions(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        // Then iOS offsets the badge past the avatar's corner as the JS badge does, while Android keeps it inside, since Material would shrink a larger icon to fit its slot
        expect(mockGetTabBarIcon.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({emojiStatusOffset: expectedEmojiStatusOffset}));
    });
});
