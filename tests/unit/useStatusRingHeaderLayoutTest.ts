import {act, renderHook} from '@testing-library/react-native';

import useStatusRingHeaderLayout from '@hooks/useStatusRingHeaderLayout/index.ios';

import type {TopBarRegion} from '@expensify/nitro-utils';

const mockNativeWindowBars = {
    topBarRegion: undefined as TopBarRegion | undefined,
    listeners: new Set<() => void>(),
    setTopBarRegion(region: TopBarRegion | undefined) {
        this.topBarRegion = region;
        for (const listener of this.listeners) {
            listener();
        }
    },
};

jest.mock('@expensify/nitro-utils', () => ({
    WindowBarsNitroModule: {
        // The native getter builds a new object on every read.
        get topBarRegion() {
            return mockNativeWindowBars.topBarRegion ? {...mockNativeWindowBars.topBarRegion} : undefined;
        },
        verticalBarEdge: 'unspecified',
        addChangeListener: (onChange: () => void) => {
            mockNativeWindowBars.listeners.add(onChange);
            return () => mockNativeWindowBars.listeners.delete(onChange);
        },
    },
}));

jest.mock('@hooks/useSafeAreaInsets', () => () => ({top: 82, bottom: 34, left: 0, right: 0}));
jest.mock('@hooks/useContentHeaderHeight', () => () => ({contentHeaderHeight: 64}));
jest.mock('@libs/isTablet', () => () => false);

/** What the iPhone Duo's inner panel reports in portrait: a bar starting 24pt down, beside a ring 128pt wide past the screen's corner. */
const INNER_PANEL_PORTRAIT_REGION: TopBarRegion = {top: 24, height: 44, left: 0, right: 128};

describe('useStatusRingHeaderLayout', () => {
    beforeEach(() => {
        mockNativeWindowBars.topBarRegion = undefined;
        mockNativeWindowBars.listeners.clear();
    });

    it('places the header beside the status ring while UIKit reports a top bar region, and below the inset otherwise', () => {
        // Given the iPhone Duo open in portrait, where UIKit lets a bar start inside the 82pt top inset
        mockNativeWindowBars.topBarRegion = INNER_PANEL_PORTRAIT_REGION;
        const {result, unmount} = renderHook(() => useStatusRingHeaderLayout());
        const unfoldedLayout = result.current;

        // When the phone folds, so that the region goes away
        act(() => mockNativeWindowBars.setTopBarRegion(undefined));

        // Then the header row is centered where UIKit centers its bar, the content below the header clears the ring,
        // and once folded the header goes back below the inset
        expect(unfoldedLayout).toEqual({topOffset: 14, bottomOffset: 4, left: 0, right: 128, height: 82});
        expect(result.current).toBeUndefined();
        unmount();
        expect(mockNativeWindowBars.listeners.size).toBe(0);
    });
});
