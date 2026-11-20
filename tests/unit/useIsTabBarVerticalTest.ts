import {act, renderHook} from '@testing-library/react-native';

import useIsTabBarVertical from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIsTabBarVertical/index.ios';

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

describe('useIsTabBarVertical', () => {
    beforeEach(() => {
        mockNativeVerticalBar.edge = 'unspecified';
        mockNativeVerticalBar.listeners.clear();
    });

    it('reports a column only while UIKit names an edge for the vertical bar', () => {
        // Given a window whose trait collection names no vertical bar edge
        const {result, unmount} = renderHook(() => useIsTabBarVertical());
        expect(result.current).toBe(false);

        // When the phone folds so that the bar moves to the trailing edge, and then rotates so that it goes away again
        act(() => mockNativeVerticalBar.setEdge('trailing'));
        const isVerticalWhileFolded = result.current;
        act(() => mockNativeVerticalBar.setEdge('unspecified'));

        // Then the hook follows the native trait both ways and stops listening once unmounted
        expect(isVerticalWhileFolded).toBe(true);
        expect(result.current).toBe(false);
        unmount();
        expect(mockNativeVerticalBar.listeners.size).toBe(0);
    });
});
