import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import {isReportActionVisible} from '@libs/ReportActionsUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';

import type {RouteProp} from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import type Report from '../../src/types/onyx/Report';

import ParentNavigationSubtitle from '../../src/components/ParentNavigationSubtitle';
import CONST from '../../src/CONST';
import NAVIGATORS from '../../src/NAVIGATORS';
import ONYXKEYS from '../../src/ONYXKEYS';
import ROUTES from '../../src/ROUTES';
import SCREENS from '../../src/SCREENS';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        getTopmostReportId: jest.fn(),
        getTopmostSuperWideRHPReportID: jest.fn(),
        dismissModal: jest.fn(),
        dismissToSuperWideRHP: jest.fn(),
        goBack: jest.fn(),
        setParams: jest.fn(),
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
    },
}));

jest.mock('@libs/ReportActionsUtils', () => ({
    getReportAction: jest.fn(() => undefined),
    isReportActionVisible: jest.fn(() => false),
}));

jest.mock('@libs/ReportUtils', () => {
    const actualReportUtils = jest.requireActual<Record<string, unknown>>('@libs/ReportUtils');
    return {
        ...actualReportUtils,
        getPolicyExpenseChat: jest.fn(),
    };
});

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
        mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: 'SearchReport'}));
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
        mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: 'SearchReport'}));
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
        mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: 'SearchReport'}));
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

        mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: SCREENS.REPORT}));
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

        mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: SCREENS.REPORT}));
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

        mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: SCREENS.REPORT}));
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

    describe('subtitle of a bill without a parent report', () => {
        const billReportID = 'bill-report';
        const subtitleData = {reportName: "bob's expenses", workspaceName: "Receiver's Workspace"};

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            await Onyx.clear();
            mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: SCREENS.REPORT}));
        });

        it('opens the policy expense chat from the subtitle of a bill without a parent report', async () => {
            // Given a bill with no parent report, and its owner's workspace chat
            const policyExpenseChatID = 'policy-expense-chat';
            const ownerAccountID = 123;
            const policyID = 'policy-id';
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${billReportID}`, createMock<Report>({reportID: billReportID, type: CONST.REPORT.TYPE.BILL, ownerAccountID, policyID}));
            jest.mocked(getPolicyExpenseChat).mockReturnValue(createMock<Report>({reportID: policyExpenseChatID}));
            render(
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={subtitleData}
                    reportID={billReportID}
                />,
            );
            await waitForBatchedUpdates();

            // When the subtitle link is pressed
            fireEvent(screen.getByTestId('parent-navigation-subtitle-link'), 'press', {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                nativeEvent: {},
            });

            // Then it opens the workspace chat of the bill's owner
            expect(getPolicyExpenseChat).toHaveBeenCalledWith(ownerAccountID, policyID);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(policyExpenseChatID));
        });

        it('renders the subtitle of a bill without a parent report as text when its policy expense chat is unavailable', async () => {
            // Given a bill with no parent report, and no workspace chat for its owner
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${billReportID}`, createMock<Report>({reportID: billReportID, type: CONST.REPORT.TYPE.BILL}));
            jest.mocked(getPolicyExpenseChat).mockReturnValue(undefined);

            // When the subtitle renders
            render(
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={subtitleData}
                    reportID={billReportID}
                />,
            );
            await waitForBatchedUpdates();

            // Then the report name shows as plain text
            expect(screen.queryByTestId('parent-navigation-subtitle-link')).toBeNull();
            expect(screen.getByText(subtitleData.reportName)).toBeTruthy();
        });
    });

    describe('visible report actions subscription', () => {
        const parentReportID = 'parent-report';
        const otherReportID = 'other-report';
        const expenseReportID = 'expense-report';
        const parentReportActionID = 'parent-action';
        const otherReportActionID = 'other-action';
        const subtitleData = {reportName: 'Parent chat', workspaceName: 'Workspace'};

        function pressSubtitleLink() {
            fireEvent(screen.getByTestId('parent-navigation-subtitle-link'), 'press', {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                nativeEvent: {},
            });
        }

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            await Onyx.clear();
            mockUseRoute.mockReturnValue(createMock<AnyRoute>({name: SCREENS.REPORT}));
            mockUseRootNavigationState.mockImplementation((selector?: (state: unknown) => unknown) => {
                const mockState = getMockRootStateWithReportsSplitStack(otherReportID, expenseReportID);
                if (selector) {
                    return selector(mockState);
                }
                return undefined;
            });
        });

        it('renders the parent report name as plain text when the user has no access to the parent report', async () => {
            // Given the current report says the user cannot access its parent
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {reportID: expenseReportID, hasParentAccess: false});

            // When the subtitle renders
            render(
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={subtitleData}
                    parentReportID={parentReportID}
                    reportID={expenseReportID}
                />,
            );
            await waitForBatchedUpdates();

            // Then the parent name is shown without the link, because hasParentAccess is read through getReportHasParentAccess
            expect(screen.queryByTestId('parent-navigation-subtitle-link')).toBeNull();
            expect(screen.getByText(subtitleData.reportName)).toBeTruthy();
        });

        it('passes only the parent report visibility to isReportActionVisible', async () => {
            // Given visibility data for the parent report and for an unrelated report
            await Onyx.set(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                [parentReportID]: {[parentReportActionID]: true},
                [otherReportID]: {[otherReportActionID]: true},
            });
            render(
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={subtitleData}
                    parentReportID={parentReportID}
                    parentReportActionID={parentReportActionID}
                    reportID={expenseReportID}
                />,
            );
            await waitForBatchedUpdates();

            // When the parent link is pressed
            pressSubtitleLink();

            // Then the visibility check receives only the parent report slice, because the component subscribes through
            // reportVisibleActionsSelector instead of the whole derived map
            expect(jest.mocked(isReportActionVisible).mock.calls.at(0)?.at(3)).toEqual({[parentReportID]: {[parentReportActionID]: true}});
        });

        it('reads the new parent report visibility when parentReportID changes', async () => {
            // Given visibility data for two reports and a subtitle pointing at the first one
            await Onyx.set(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                [parentReportID]: {[parentReportActionID]: true},
                [otherReportID]: {[parentReportActionID]: false},
            });
            const {rerender} = render(
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={subtitleData}
                    parentReportID={parentReportID}
                    parentReportActionID={parentReportActionID}
                    reportID={expenseReportID}
                />,
            );
            await waitForBatchedUpdates();

            // When the subtitle is re-rendered for a different parent report
            rerender(
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={subtitleData}
                    parentReportID={otherReportID}
                    parentReportActionID={parentReportActionID}
                    reportID={expenseReportID}
                />,
            );
            await waitForBatchedUpdates();
            pressSubtitleLink();

            // Then the visibility check uses the new parent's slice, because the selector is rebuilt for the new parentReportID
            expect(jest.mocked(isReportActionVisible).mock.calls.at(0)?.at(3)).toEqual({[otherReportID]: {[parentReportActionID]: false}});
        });
    });
});
