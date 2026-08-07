import {renderHook} from '@testing-library/react-native';

import type {RHPWidth} from '@components/WideRHPContextProvider/types';

import type ResponsiveLayoutOnWideRHPResult from '@hooks/useResponsiveLayoutOnWideRHP/types';

import type * as ReactNavigationModule from '@react-navigation/native';

import React from 'react';

let mockDisplayedWidth: Exclude<RHPWidth, 'narrow'> | undefined;
jest.mock('@components/WideRHPContextProvider', () => ({
    __esModule: true,
    getVisibleRHPRouteWidth: (routeKey: string | undefined) => (routeKey === 'route-1' ? mockDisplayedWidth : undefined),
    subscribeToVisibleRHPRouteKeys: () => () => {},
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
// Required by path: jest resolves the platform variant first, and index.native.ts has no wide RHP to report on.
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
        mockDisplayedWidth = undefined;
        mockIsSmallScreenWidth = false;
    });

    it('renders outside a navigator screen, where the route hook it replaced would have thrown', () => {
        const {result} = renderOnRoute(undefined);

        expect(result.current.shouldUseNarrowLayout).toBe(true);
        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.isSuperWideRHPDisplayedOnWideLayout).toBe(false);
    });

    it('drops the narrow layout while its own route is displayed wide, and keeps the unadjusted value alongside it', () => {
        mockDisplayedWidth = 'wide';
        const {result} = renderOnRoute('route-1');

        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(true);
        expect(result.current.shouldUseNarrowLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayoutIgnoringWideRHP).toBe(true);
    });

    it('reports super-wide separately from wide', () => {
        mockDisplayedWidth = 'super-wide';
        const {result} = renderOnRoute('route-1');

        expect(result.current.isSuperWideRHPDisplayedOnWideLayout).toBe(true);
        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayout).toBe(false);
    });

    it('ignores a width another route is displayed at', () => {
        mockDisplayedWidth = 'wide';
        const {result} = renderOnRoute('route-2');

        expect(result.current.isWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayout).toBe(true);
    });

    it('stays narrow on a small screen, where the wide RHP does not exist however the route is registered', () => {
        mockDisplayedWidth = 'super-wide';
        mockIsSmallScreenWidth = true;
        const {result} = renderOnRoute('route-1');

        expect(result.current.isSuperWideRHPDisplayedOnWideLayout).toBe(false);
        expect(result.current.shouldUseNarrowLayout).toBe(true);
    });
});
