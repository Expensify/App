import {act, renderHook} from '@testing-library/react-native';

import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';

import variables from '@styles/variables';

import type CONST from '@src/CONST';

import type {VerticalBarEdge} from '@expensify/nitro-utils';

const mockNativeVerticalBar = {
    edge: 'unspecified' as VerticalBarEdge,
    listeners: new Set<() => void>(),
    setEdge(edge: VerticalBarEdge) {
        this.edge = edge;
        for (const listener of this.listeners) {
            listener();
        }
    },
};

// The width of the iPhone Duo's vertical bar, which the window reports as its side inset
const mockVerticalBarInset = 84;
const mockInsets = {top: 0, right: mockVerticalBarInset, bottom: 34, left: 0};

jest.mock('@expensify/nitro-utils', () => ({
    VERTICAL_BAR_EDGE: {UNSPECIFIED: 'unspecified', LEADING: 'leading', TRAILING: 'trailing'},
    WindowBarsNitroModule: {
        get verticalBarEdge() {
            return mockNativeVerticalBar.edge;
        },
        topBarRegion: undefined,
        addChangeListener: (onChange: () => void) => {
            mockNativeVerticalBar.listeners.add(onChange);
            return () => mockNativeVerticalBar.listeners.delete(onChange);
        },
    },
}));
jest.mock('@libs/getPlatform', () => () => jest.requireActual<{default: typeof CONST}>('@src/CONST').default.PLATFORM.IOS);
// Jest resolves the hook's fallback file, while the vertical bar only exists in its iOS one.
jest.mock('@hooks/useHasVerticalBar', () => jest.requireActual<Record<string, unknown>>('@hooks/useHasVerticalBar/index.ios'));
// The same object every render, as when the window's insets have not changed.
jest.mock('@hooks/useSafeAreaInsets', () => () => mockInsets);

describe('useSafeAreaPaddings', () => {
    beforeEach(() => {
        mockNativeVerticalBar.edge = 'unspecified';
        mockNativeVerticalBar.listeners.clear();
    });

    it('keeps the whole side inset once the vertical bar is reported, even when the insets have not changed', () => {
        // Given a foldable iPhone whose window is read only after the first render, so the side inset is already the
        // vertical bar's while the native module still names no edge for it
        const {result} = renderHook(() => useSafeAreaPaddings());
        const paddingRightBeforeWindowRead = result.current.paddingRight;

        // When the native module reads the window and reports the bar, with the same insets as before
        act(() => mockNativeVerticalBar.setEdge('trailing'));

        // Then the side padding grows from the trimmed inset to the whole bar, because the hook follows the native state
        // instead of waiting for new insets that never come
        expect(paddingRightBeforeWindowRead).toBeCloseTo(mockVerticalBarInset * variables.iosSafeAreaInsetsPercentage);
        expect(result.current.paddingRight).toBe(mockVerticalBarInset);
    });
});
