import {render} from '@testing-library/react-native';

import type useRHPWidthType from '@components/WideRHPContextProvider/useRHPWidth';

import NAVIGATORS from '@src/NAVIGATORS';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import {View} from 'react-native';

type TestRoute = {key: string; name: string; state?: ReactNavigationNative.PartialState<ReactNavigationNative.NavigationState>};

const mockRoute = {key: 'rhp-route-key', name: 'ReportScreen', params: {reportID: '42'}};
const mockRemoveRHPRouteKey = jest.fn();
const mockUnmarkReportRHPWidth = jest.fn();
const mockSetRHPWidth = jest.fn();
const mockGetReportRHPWidthHint = jest.fn<string | undefined, [string]>();
const mockSetExpandedRHPProgress = jest.fn();
const mockNavigationState: {isReady: boolean; routes: TestRoute[]; preloadedRoutes?: TestRoute[]} = {isReady: true, routes: []};

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => mockRoute,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigationRef: {
        isReady: () => mockNavigationState.isReady,
        getRootState: () => (mockNavigationState.isReady ? {routes: mockNavigationState.routes, preloadedRoutes: mockNavigationState.preloadedRoutes} : undefined),
    },
}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({
        setRHPWidth: mockSetRHPWidth,
        removeRHPRouteKey: mockRemoveRHPRouteKey,
        getReportRHPWidthHint: mockGetReportRHPWidthHint,
        unmarkReportRHPWidth: mockUnmarkReportRHPWidth,
    }),
    expandedRHPProgress: {setValue: mockSetExpandedRHPProgress},
}));

// Jest (jest-expo) resolves the `.native` variant by default, and on native the hook is a no-op, so the web entry
// point is required explicitly (with its `.ts` extension) to exercise the real implementation.
const useRHPWidthModule: unknown = require('@components/WideRHPContextProvider/useRHPWidth/index.ts');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const useRHPWidth = (useRHPWidthModule as {default: typeof useRHPWidthType}).default;

function WideRHPScreen({width = 'wide'}: {width?: Parameters<typeof useRHPWidthType>[0]}) {
    useRHPWidth(width);
    return <View testID="rhp-screen" />;
}

const RHP_ROUTE_IN_STATE: TestRoute = {
    key: 'root-rhp',
    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    state: {routes: [{key: mockRoute.key, name: mockRoute.name}]},
};

describe('useRHPWidth', () => {
    beforeEach(() => {
        mockNavigationState.isReady = true;
        mockNavigationState.routes = [RHP_ROUTE_IN_STATE];
        mockNavigationState.preloadedRoutes = undefined;
        mockGetReportRHPWidthHint.mockReturnValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('registers the width of its route', () => {
        render(<WideRHPScreen />);

        expect(mockSetRHPWidth).toHaveBeenCalledWith(mockRoute, 'wide');
    });

    describe('when the screen is only hidden by Activity', () => {
        it('keeps the width registration, because the route is still in the navigation state', () => {
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockRemoveRHPRouteKey).not.toHaveBeenCalled();
        });

        it('keeps the per report width hint', () => {
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockUnmarkReportRHPWidth).not.toHaveBeenCalled();
        });

        it('finds the route however deep it sits in the navigation state', () => {
            mockNavigationState.routes = [
                {key: 'root-tab', name: NAVIGATORS.TAB_NAVIGATOR},
                {
                    key: 'root-rhp',
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                key: 'nested-stack',
                                name: 'ReportsSplitNavigator',
                                state: {routes: [{key: mockRoute.key, name: mockRoute.name}]},
                            },
                        ],
                    },
                },
            ];
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockRemoveRHPRouteKey).not.toHaveBeenCalled();
        });

        it('leaves the expanded RHP animation running', () => {
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockSetExpandedRHPProgress).not.toHaveBeenCalled();
        });

        it('keeps the width registration of a route that is only preloaded', () => {
            mockNavigationState.routes = [{key: 'root-tab', name: NAVIGATORS.TAB_NAVIGATOR}];
            mockNavigationState.preloadedRoutes = [RHP_ROUTE_IN_STATE];
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockRemoveRHPRouteKey).not.toHaveBeenCalled();
        });
    });

    describe('when the screen is actually closed', () => {
        beforeEach(() => {
            mockNavigationState.routes = [{key: 'root-tab', name: NAVIGATORS.TAB_NAVIGATOR}];
        });

        it('deregisters the width of its route', () => {
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockRemoveRHPRouteKey).toHaveBeenCalledWith(mockRoute);
        });

        it('clears the per report width hint so it cannot pin the report wide on a later visit', () => {
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockUnmarkReportRHPWidth).toHaveBeenCalledWith('42');
        });

        it('folds the expanded RHP when no RHP is left on top of the root stack', () => {
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockSetExpandedRHPProgress).toHaveBeenCalledWith(0);
        });

        it('keeps the expanded RHP while another RHP is still on top', () => {
            mockNavigationState.routes = [{key: 'root-tab', name: NAVIGATORS.TAB_NAVIGATOR}, RHP_ROUTE_IN_STATE];
            const {unmount} = render(<WideRHPScreen />);

            unmount();

            expect(mockSetExpandedRHPProgress).not.toHaveBeenCalled();
        });
    });

    it('deregisters the width when the navigation state cannot be read', () => {
        mockNavigationState.isReady = false;
        const {unmount} = render(<WideRHPScreen />);

        unmount();

        expect(mockRemoveRHPRouteKey).toHaveBeenCalledWith(mockRoute);
    });

    describe('width hints', () => {
        it('opens the screen at the hinted width when it outranks the requested one', () => {
            mockGetReportRHPWidthHint.mockReturnValue('super-wide');

            render(<WideRHPScreen width="wide" />);

            expect(mockSetRHPWidth).toHaveBeenCalledWith(mockRoute, 'super-wide');
        });

        it('keeps the requested width when it already matches the hint', () => {
            mockGetReportRHPWidthHint.mockReturnValue('wide');

            render(<WideRHPScreen width="wide" />);

            expect(mockSetRHPWidth).toHaveBeenCalledWith(mockRoute, 'wide');
        });

        it('clears the hint once the requested width catches up with it', () => {
            mockGetReportRHPWidthHint.mockReturnValue('wide');

            render(<WideRHPScreen width="wide" />);

            expect(mockUnmarkReportRHPWidth).toHaveBeenCalledWith('42', 'wide');
        });
    });
});
