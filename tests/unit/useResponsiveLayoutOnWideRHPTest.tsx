import {renderHook} from '@testing-library/react-native';

import type {RHPWidth} from '@components/WideRHPContextProvider/types';

import type ResponsiveLayoutOnWideRHPResult from '@hooks/useResponsiveLayoutOnWideRHP/types';

import type * as ReactNavigationModule from '@react-navigation/native';

import React from 'react';

let mockRHPWidth: Exclude<RHPWidth, 'narrow'> | undefined;
jest.mock('@components/WideRHPContextProvider', () => ({
    __esModule: true,
    getRHPRouteWidth: (routeKey: string | undefined) => (routeKey === 'route-1' ? mockRHPWidth : undefined),
    subscribeToRHPRouteKeys: () => () => {},
}));

let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({
        isSmallScreenWidth: mockIsSmallScreenWidth,
        isInNarrowPaneModal: true,
        shouldUseNarrowLayout: true,
    }),
}));

const {NavigationRouteContext} = require<typeof ReactNavigationModule>('@react-navigation/native');
// Required by path: jest would resolve index.native.ts, which has no wide RHP.
const {default: useResponsiveLayoutOnWideRHP} = require<{default: () => ResponsiveLayoutOnWideRHPResult}>('../../src/hooks/useResponsiveLayoutOnWideRHP/index.ts');

function renderOnRoute(routeKey: string | undefined) {
    const wrapper =
        routeKey === undefined
            ? undefined
            : ({children}: {children: React.ReactNode}) => <NavigationRouteContext.Provider value={{key: routeKey, name: 'Screen'}}>{children}</NavigationRouteContext.Provider>;
    return renderHook(() => useResponsiveLayoutOnWideRHP(), {wrapper});
}

describe('useResponsiveLayoutOnWideRHP', () => {
    beforeEach(() => {
        mockRHPWidth = undefined;
        mockIsSmallScreenWidth = false;
    });

    it('renders outside a navigator screen, where the route hook it replaced would have thrown', () => {
        // Given a caller rendered outside any navigator screen, so there is no route to look up
        // When it reads its layout
        const {result} = renderOnRoute(undefined);

        // Then it gets the plain narrow RHP layout instead of throwing
        expect(result.current.shouldUseNarrowLayout).toBe(true);
        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.isSuperWideRHPDisplayedOnWideLayout).toBe(false);
    });

    it('drops the narrow layout while its own route is displayed wide', () => {
        // Given a screen whose own route is shown in a wide RHP on a wide layout
        mockRHPWidth = 'wide';

        // When it reads its layout
        const {result} = renderOnRoute('route-1');

        // Then it uses the wide layout, since the wide RHP has room for it
        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(true);
        expect(result.current.shouldUseNarrowLayout).toBe(false);
    });

    it('reports super-wide separately from wide', () => {
        // Given a screen whose own route is shown in a super-wide RHP on a wide layout
        mockRHPWidth = 'super-wide';

        // When it reads its layout
        const {result} = renderOnRoute('route-1');

        // Then it is told super-wide rather than wide, and still drops the narrow layout
        expect(result.current.isSuperWideRHPDisplayedOnWideLayout).toBe(true);
        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayout).toBe(false);
    });

    it('ignores a width another route is displayed at', () => {
        // Given another route shown wide, as when this narrow screen is stacked on top of a wide one
        mockRHPWidth = 'wide';

        // When this screen reads its layout
        const {result} = renderOnRoute('route-2');

        // Then it keeps the narrow layout, since only its own route's width applies to it
        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayout).toBe(true);
    });

    it('stays narrow on a small screen, where the wide RHP does not exist however the route is registered', () => {
        // Given a screen whose route is registered super-wide, but on a small screen
        mockRHPWidth = 'super-wide';
        mockIsSmallScreenWidth = true;

        // When it reads its layout
        const {result} = renderOnRoute('route-1');

        // Then it keeps the narrow layout and is not told it is super-wide
        expect(result.current.isSuperWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayout).toBe(true);
    });
});
