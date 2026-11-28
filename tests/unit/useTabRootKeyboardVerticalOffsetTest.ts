import {renderHook} from '@testing-library/react-native';

import useTabBarCoveredHeight from '@components/Navigation/TabBarBottomContent/useTabBarCoveredHeight/index.ios';
import useDefaultTabRootKeyboardVerticalOffset from '@components/Navigation/TabBarBottomContent/useTabRootKeyboardVerticalOffset/index';
import useTabRootKeyboardVerticalOffset from '@components/Navigation/TabBarBottomContent/useTabRootKeyboardVerticalOffset/index.ios';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

let mockShouldUseNarrowLayout = true;

jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));
jest.mock('@hooks/useSafeAreaInsets', () => jest.fn(() => ({top: 47, bottom: 34, left: 0, right: 0})));
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'ios',
}));
jest.mock('@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical', () => jest.fn(() => false));

function renderTabRoot() {
    return renderHook(() => ({
        offset: useTabRootKeyboardVerticalOffset(),
        footerPadding: useTabBarCoveredHeight(),
        safeAreaPaddingBottom: useSafeAreaPaddings(true).paddingBottom,
    })).result.current;
}

describe('useTabRootKeyboardVerticalOffset', () => {
    afterEach(() => {
        mockShouldUseNarrowLayout = true;
    });

    it('lifts a narrow iOS tab root past the whole band its footer pads', () => {
        // Given a narrow iPhone with a home indicator, where the footer pads past the UITabBar and the inset under it
        const {offset, footerPadding, safeAreaPaddingBottom} = renderTabRoot();

        // When the KeyboardAvoidingView adds its own bottom safe area offset to the one from the hook
        const keyboardVerticalOffset = offset - safeAreaPaddingBottom;

        // Then the screen is lifted by the keyboard height minus the footer padding, so no blank band is left above the keyboard
        expect(keyboardVerticalOffset).toBeCloseTo(-footerPadding);
        expect(footerPadding).toBeGreaterThan(safeAreaPaddingBottom);
    });

    it('does not change the lift on a wide layout or off iOS', () => {
        // Given a wide layout, where the tab bar covers nothing of the screen
        mockShouldUseNarrowLayout = false;

        // When the offset is read on iOS and on the other platforms
        const {offset} = renderTabRoot();
        const {result} = renderHook(() => useDefaultTabRootKeyboardVerticalOffset());

        // Then the KeyboardAvoidingView keeps the lift it has today
        expect(offset).toBe(0);
        expect(result.current).toBe(0);
    });
});
