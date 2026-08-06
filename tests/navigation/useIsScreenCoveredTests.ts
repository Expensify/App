import {renderHook} from '@testing-library/react-native';

import useIsScreenCovered from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsScreenCovered';

import type * as ReactNavigationNative from '@react-navigation/native';

const mockIsFocused = jest.fn<boolean, []>();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused(),
}));

describe('useIsScreenCovered', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('reports the top screen of a focused navigator as not covered', () => {
        mockIsFocused.mockReturnValue(true);

        const {result} = renderHook(() => useIsScreenCovered(false));

        expect(result.current).toBe(false);
    });

    it('reports a screen covered by another screen of its own navigator as covered', () => {
        mockIsFocused.mockReturnValue(true);

        const {result} = renderHook(() => useIsScreenCovered(true));

        expect(result.current).toBe(true);
    });

    it('reports the top screen of a navigator that lost focus higher in the tree as covered', () => {
        mockIsFocused.mockReturnValue(false);

        const {result} = renderHook(() => useIsScreenCovered(false));

        expect(result.current).toBe(true);
    });

    it('follows the navigation state on the very first render, unlike the Activity mode', () => {
        mockIsFocused.mockReturnValue(true);

        const {result} = renderHook(() => useIsScreenCovered(true));

        expect(result.current).toBe(true);
    });

    it('stops reporting a screen as covered as soon as it is focused again', () => {
        mockIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook((isScreenBlurred: boolean) => useIsScreenCovered(isScreenBlurred), {initialProps: true});

        rerender(false);

        expect(result.current).toBe(false);
    });
});
