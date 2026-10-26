import {renderHook} from '@testing-library/react-native';

import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import useAndroidNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.android';
import useIOSNativeTabBarOptions from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/index.ios';
import type NativeTabBarOptionsParams from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useNativeTabBarOptions/types';

import NAVIGATORS from '@src/NAVIGATORS';

let mockEmojiCode: string | undefined;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, status: mockEmojiCode ? {emojiCode: mockEmojiCode} : undefined}),
}));

const mockGetTabBarIcon = jest.mocked(getTabBarIcon);

const PARAMS: NativeTabBarOptionsParams = {
    shouldShowNativeTabBar: true,
    isAccountAvatarShown: true,
    dotColors: {},
    tabLabels: {
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: 'Inbox',
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: 'Account',
    },
};

/** The emoji each selection state of a tab's icon is drawn with. */
function getDrawnEmojis(): Array<string | undefined> {
    const getParams = mockGetTabBarIcon.mock.calls.at(-1)?.at(1);
    if (typeof getParams !== 'function') {
        return [];
    }
    return [getParams(false).emojiStatus?.emoji, getParams(true).emojiStatus?.emoji];
}

describe.each([
    ['Android', useAndroidNativeTabBarOptions],
    ['iOS', useIOSNativeTabBarOptions],
])('%s useNativeTabBarOptions', (_platform, useNativeTabBarOptions) => {
    beforeEach(() => {
        mockEmojiCode = undefined;
        mockGetTabBarIcon.mockClear();
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
});
