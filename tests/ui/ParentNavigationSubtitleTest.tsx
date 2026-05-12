import type {RouteProp} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {isReportActionVisible} from '@libs/ReportActionsUtils';
import ParentNavigationSubtitle from '../../src/components/ParentNavigationSubtitle';
import NAVIGATORS from '../../src/NAVIGATORS';
import SCREENS from '../../src/SCREENS';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@libs/ReportActionsUtils', () => ({
    getReportAction: jest.fn(() => undefined),
    isReportActionVisible: jest.fn(() => false),
}));

const mockUseRootNavigationState = jest.fn();
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector?: (state: unknown) => unknown) => mockUseRootNavigationState(selector) as unknown,
}));

type AnyRoute = RouteProp<Record<string, Record<string, unknown> | undefined>, string>;
const mockUseRoute = jest.fn<AnyRoute, []>();
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actualNav = jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockUseRoute(),
    };
});

/** Root state with TabNavigator → Reports split stack [parent DM, expense]; index on expense (matches issue #88499 stack). */
function getMockRootStateWithReportsSplitStack(parentReportID: string, expenseReportID: string) {
    const parentRoute = {
        name: SCREENS.REPORT,
        params: {reportID: parentReportID},
        key: 'route-parent-key',
    };
    const expenseRoute = {
        name: SCREENS.REPORT,
        params: {reportID: expenseReportID},
        key: 'route-expense-key',
    };
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                key: 'tab-root-key',
                state: {
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            key: 'reports-split-route-key',
                            state: {
                                key: 'reports-split-state-key',
                                index: 1,
                                routes: [parentRoute, expenseRoute],
                            },
                        },
                    ],
                },
            },
        ],
    };
}

describe('ParentNavigationSubtitle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(isReportActionVisible).mockReturnValue(false);
        Navigation.getTopmostReportId = jest.fn();
        Navigation.dismissModal = jest.fn();
        Navigation.goBack = jest.fn();
        Navigation.setParams = jest.fn();
        Navigation.navigate = jest.fn();
    });

    it('if the parent report is already displayed underneath RHP, simply dismiss the modal', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';
        Navigation.getTopmostReportId = jest.fn(() => parentReportID);
        mockUseRoute.mockReturnValue({name: 'SearchReport'} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockRoute = {name: 'ReportsSplitNavigator'};
            if (selector) {
                return selector({routes: [mockRoute]});
            }
            return mockRoute;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab
            />,
        );

        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };

        fireEvent(clickableElement, 'press', mockEvent);

        expect(Navigation.dismissModal).toHaveBeenCalled();
    });

    it('if currentFullScreenRoute name is not REPORTS_SPLIT_NAVIGATOR, should NOT call Navigation.dismissModal', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';
        Navigation.getTopmostReportId = jest.fn(() => parentReportID);
        mockUseRoute.mockReturnValue({name: 'SearchReport'} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockRoute = {name: 'SettingsSplitNavigator'};
            if (selector) {
                return selector({routes: [mockRoute]});
            }
            return mockRoute;
        });
        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab
            />,
        );
        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };
        fireEvent(clickableElement, 'press', mockEvent);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('if getTopmostReportId does not match parentReportID, should NOT call Navigation.dismissModal', () => {
        const parentReportID = '123';
        const reportName = 'Report Name';
        const workspaceName = 'Workspace Name';
        Navigation.getTopmostReportId = jest.fn(() => '999');
        mockUseRoute.mockReturnValue({name: 'SearchReport'} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockRoute = {name: 'ReportsSplitNavigator'};
            if (selector) {
                return selector({routes: [mockRoute]});
            }
            return mockRoute;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID="456"
                openParentReportInCurrentTab
            />,
        );

        const clickableElement = screen.getByTestId('parent-navigation-subtitle-link');
        const mockEvent = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        };

        fireEvent(clickableElement, 'press', mockEvent);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('goes back without navigating when parent report is already the previous route in Reports split stack under Tab navigator', () => {
        const parentReportID = 'parent-report';
        const expenseReportID = 'expense-report';
        const reportName = 'Parent chat';
        const workspaceName = 'Workspace';

        mockUseRoute.mockReturnValue({name: SCREENS.REPORT} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockState = getMockRootStateWithReportsSplitStack(parentReportID, expenseReportID);
            if (selector) {
                return selector(mockState);
            }
            return undefined;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID={expenseReportID}
            />,
        );

        fireEvent(screen.getByTestId('parent-navigation-subtitle-link'), 'press', {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        });

        expect(Navigation.goBack).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('sets reportActionID on the previous route then goes back when the parent action is visible', () => {
        const parentReportID = 'parent-report';
        const expenseReportID = 'expense-report';
        const parentReportActionID = 'action-999';
        const reportName = 'Parent chat';
        const workspaceName = 'Workspace';

        jest.mocked(isReportActionVisible).mockReturnValue(true);

        mockUseRoute.mockReturnValue({name: SCREENS.REPORT} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockState = getMockRootStateWithReportsSplitStack(parentReportID, expenseReportID);
            if (selector) {
                return selector(mockState);
            }
            return undefined;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                parentReportActionID={parentReportActionID}
                reportID={expenseReportID}
            />,
        );

        fireEvent(screen.getByTestId('parent-navigation-subtitle-link'), 'press', {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        });

        expect(Navigation.setParams).toHaveBeenCalledWith({reportActionID: parentReportActionID}, 'route-parent-key', 'reports-split-state-key');
        expect(Navigation.goBack).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('navigates forward when the previous stack route is not the parent report', () => {
        const parentReportID = 'parent-report';
        const expenseReportID = 'expense-report';
        const reportName = 'Parent chat';
        const workspaceName = 'Workspace';

        mockUseRoute.mockReturnValue({name: SCREENS.REPORT} as AnyRoute);
        mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
            const mockState = getMockRootStateWithReportsSplitStack('other-report', expenseReportID);
            if (selector) {
                return selector(mockState);
            }
            return undefined;
        });

        render(
            <ParentNavigationSubtitle
                parentNavigationSubtitleData={{reportName, workspaceName}}
                parentReportID={parentReportID}
                reportID={expenseReportID}
            />,
        );

        fireEvent(screen.getByTestId('parent-navigation-subtitle-link'), 'press', {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            nativeEvent: {},
        });

        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalled();
    });
});
