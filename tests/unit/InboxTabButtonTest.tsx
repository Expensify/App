import {fireEvent, render, screen} from '@testing-library/react-native';

import InboxTabButton from '@components/Navigation/NavigationTabBar/InboxTabButton';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockStartOpenReportSpan = jest.fn();
const mockStartSpan = jest.fn();

let mockOnyxEntry: {reportID: string} | undefined = {reportID: '123'};
let mockRootState: unknown;
let mockLastRoute: {params: {reportID: string}} | undefined = {params: {reportID: '123'}};

type PressableProps = {
    accessibilityLabel: string;
    children: ReactNode | ((state: {hovered: boolean}) => ReactNode);
    onPress: () => void;
};

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{accessibilityLabel: string; onPress: () => void; testID: string}>;
};

jest.mock('@components/Pressable', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');

    return {
        PressableWithFeedback: ({accessibilityLabel, onPress}: PressableProps) =>
            createElement(View, {
                accessibilityLabel,
                onPress,
                testID: 'inbox-tab-button',
            }),
    };
});

jest.mock('@components/Navigation/NavigationTabBar/TabBarItem', () => () => null);
jest.mock('@components/Navigation/NavigationTabBar/getLastRoute', () => () => mockLastRoute);
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Inbox: 'inbox-icon'})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useSidebarOrderedReports', () => ({useSidebarOrderedReportsState: () => ({chatTabBrickRoad: undefined})}));
jest.mock('@hooks/useTheme', () => () => ({danger: 'danger', iconSuccessFill: 'success'}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {},
    leftNavigationTabBarItem: {},
    navigationTabBarItem: {},
    navigationTabBarItemHovered: {},
}));

jest.mock('@hooks/useRootNavigationState', () => (selector: (state: unknown) => unknown) => selector(mockRootState));

jest.mock('@hooks/useOnyx', () => (_key: string, options?: {selector?: (entry: {reportID: string} | undefined) => unknown}) => {
    return [options?.selector ? options.selector(mockOnyxEntry) : mockOnyxEntry];
});

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        dispatch: (action: unknown) => {
            mockDispatch(action);
        },
        getRootState: () => mockRootState,
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (route: string) => {
            mockNavigate(route);
        },
    },
    startOpenReportSpan: (route: string) => {
        mockStartOpenReportSpan(route);
    },
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: (...args: unknown[]) => {
        mockStartSpan(...args);
        return undefined;
    },
}));

function buildRootState() {
    return {
        key: 'root-state',
        index: 0,
        routes: [
            {
                key: 'tab-route',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    key: 'tab-state',
                    index: 0,
                    routes: [
                        {
                            key: 'reports-route',
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            state: {
                                key: 'reports-state',
                                index: 1,
                                routes: [
                                    {key: 'inbox-route', name: SCREENS.INBOX},
                                    {key: 'report-route', name: SCREENS.REPORT, params: {reportID: '123'}},
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    };
}

describe('InboxTabButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnyxEntry = {reportID: '123'};
        mockRootState = buildRootState();
        mockLastRoute = {params: {reportID: '123'}};
    });

    it('starts ManualOpenReport and requests defer on the first report jump', () => {
        render(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        fireEvent.press(screen.getByTestId('inbox-tab-button'));

        expect(mockStartOpenReportSpan).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('123'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                target: 'tab-state',
                payload: expect.objectContaining({
                    params: expect.objectContaining({
                        shouldDeferInitialReportActions: true,
                        params: expect.objectContaining({
                            reportID: '123',
                        }),
                        screen: SCREENS.REPORT,
                    }),
                }),
            }),
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('reuses the report without a span or nested params after Inbox was visited', () => {
        const {rerender} = render(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );
        rerender(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.INBOX}
                isWideLayout
            />,
        );
        rerender(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        fireEvent.press(screen.getByTestId('inbox-tab-button'));

        expect(mockStartOpenReportSpan).not.toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                target: 'tab-state',
                payload: {
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                },
            }),
        );
    });

    it('requests initial report actions defer when no previous report route exists', () => {
        mockOnyxEntry = undefined;
        mockLastRoute = undefined;

        render(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        fireEvent.press(screen.getByTestId('inbox-tab-button'));

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                target: 'tab-state',
                payload: expect.objectContaining({
                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    params: {
                        shouldDeferInitialReportActions: true,
                    },
                }),
            }),
        );
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockStartOpenReportSpan).not.toHaveBeenCalled();
    });

    it('navigates to Inbox when the previous report no longer exists', () => {
        mockOnyxEntry = undefined;

        render(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        fireEvent.press(screen.getByTestId('inbox-tab-button'));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.INBOX);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockStartOpenReportSpan).not.toHaveBeenCalled();
    });

    it('navigates to Inbox when the tab navigator is not ready', () => {
        mockOnyxEntry = undefined;
        mockRootState = undefined;
        mockLastRoute = undefined;

        render(
            <InboxTabButton
                selectedTab={NAVIGATION_TABS.HOME}
                isWideLayout
            />,
        );

        fireEvent.press(screen.getByTestId('inbox-tab-button'));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.INBOX);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockStartOpenReportSpan).not.toHaveBeenCalled();
    });
});
