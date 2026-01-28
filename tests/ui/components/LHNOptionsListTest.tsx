import {NavigationContainer} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';
import {act, render, screen, userEvent, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import type {LHNOptionsListProps} from '@components/LHNOptionsList/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import {getFakeReport} from '../../utils/LHNTestUtils';

// Mock the context menu
jest.mock('@pages/home/report/ContextMenu/ReportActionContextMenu', () => ({
    showContextMenu: jest.fn(),
}));

// Mock the useRootNavigationState hook
jest.mock('@src/hooks/useRootNavigationState');

// Mock navigation hooks
const mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        useIsFocused: () => mockUseIsFocused(),
        useRoute: jest.fn(),
        useNavigationState: jest.fn(),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

const getReportItem = (reportID: string) => {
    return screen.findByTestId(reportID);
};

const getReportItemButton = () => {
    return userEvent.setup();
};

describe('LHNOptionsList', () => {
    const mockReport = getFakeReport([1, 2], 0, false);

    const defaultProps: LHNOptionsListProps = {
        data: [mockReport],
        onSelectRow: jest.fn(),
        optionMode: CONST.OPTION_MODE.DEFAULT,
        onFirstItemRendered: jest.fn(),
    };

    const getLHNOptionsListElement = (props: Partial<LHNOptionsListProps> = {}) => {
        const mergedProps = {
            data: props.data ?? defaultProps.data,
            onSelectRow: props.onSelectRow ?? defaultProps.onSelectRow,
            optionMode: props.optionMode ?? defaultProps.optionMode,
            onFirstItemRendered: props.onFirstItemRendered ?? defaultProps.onFirstItemRendered,
        };

        return (
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <LHNOptionsList
                        data={mergedProps.data}
                        onSelectRow={mergedProps.onSelectRow}
                        optionMode={mergedProps.optionMode}
                        onFirstItemRendered={mergedProps.onFirstItemRendered}
                    />
                </ComposeProviders>
            </NavigationContainer>
        );
    };

    beforeEach(() => {
        act(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        return act(async () => {
            await Onyx.clear();
        });
    });

    it('shows context menu on long press', async () => {
        // Given the screen is focused.
        mockUseIsFocused.mockReturnValue(true);

        // Given the LHNOptionsList is rendered with a report.
        render(getLHNOptionsListElement());

        // Then wait for the report to be displayed in the LHNOptionsList.
        const reportItem = await waitFor(() => getReportItem(mockReport.reportID));
        expect(reportItem).toBeTruthy();

        // When the user long presses the report item.
        const user = getReportItemButton();
        await user.longPress(reportItem);

        // Then wait for all state updates to complete and verify the context menu is shown
        await waitFor(() => {
            expect(showContextMenu).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.CONTEXT_MENU_TYPES.REPORT,
                    report: expect.objectContaining({
                        reportID: mockReport.reportID,
                    }),
                }),
            );
        });
    });

    it('does not show context menu when screen is not focused', async () => {
        // Given the screen is not focused.
        mockUseIsFocused.mockReturnValue(false);

        // When the LHNOptionsList is rendered.
        render(getLHNOptionsListElement());

        // Then wait for the report to be displayed in the LHNOptionsList.
        const reportItem = await waitFor(() => getReportItem(mockReport.reportID));
        expect(reportItem).toBeTruthy();

        // When the user long presses the report item.
        const user = getReportItemButton();
        await user.longPress(reportItem);

        // Then wait for all state updates to complete and verify the context menu is not shown
        await waitFor(() => {
            expect(showContextMenu).not.toHaveBeenCalled();
        });
    });

    it('shows context menu after returning from chat', async () => {
        // Given the screen is focused.
        mockUseIsFocused.mockReturnValue(true);

        // When the LHNOptionsList is rendered.
        const {rerender} = render(getLHNOptionsListElement());

        // Then wait for the report to be displayed in the LHNOptionsList.
        const reportItem = await waitFor(() => getReportItem(mockReport.reportID));
        expect(reportItem).toBeTruthy();

        // When the user navigates to chat and back by re-rendering with different focus state
        rerender(getLHNOptionsListElement());

        // When the user re-renders again to simulate returning to the screen
        rerender(getLHNOptionsListElement());

        // When the user long presses the report item.
        const user = getReportItemButton();
        await user.longPress(reportItem);

        // Then wait for all state updates to complete and verify the context menu is shown
        await waitFor(() => {
            expect(showContextMenu).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: CONST.CONTEXT_MENU_TYPES.REPORT,
                    report: expect.objectContaining({
                        reportID: mockReport.reportID,
                    }),
                }),
            );
        });
    });

    describe('DEW (Dynamic External Workflow) pending submit message', () => {
        it('shows queued message when offline with pending DEW submit', async () => {
            // Given a report is submitted while offline on a DEW policy, which creates an optimistic SUBMITTED action
            const policyID = 'dewTestPolicy';
            const reportID = 'dewTestReport';
            const accountID1 = 1;
            const accountID2 = 2;
            const policy: Policy = {
                id: policyID,
                name: 'DEW Test Policy',
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            } as Policy;
            const report: Report = {
                reportID,
                reportName: 'DEW Test Report',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                participants: {[accountID1]: {notificationPreference: 'always'}, [accountID2]: {notificationPreference: 'always'}},
            };
            const submittedAction: ReportAction = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2024-01-01 00:00:00',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                message: [{type: 'COMMENT', text: 'submitted'}],
                originalMessage: {},
            };
            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                });
            });

            // When the LHNOptionsList is rendered
            render(getLHNOptionsListElement({data: [report]}));

            // Then the queued message should be displayed because DEW submissions are processed async and the user needs feedback
            const reportItem = await waitFor(() => getReportItem(reportID));
            expect(reportItem).toBeTruthy();
            await waitFor(() => {
                expect(screen.getByText('queued to submit via custom approval workflow')).toBeTruthy();
            });
        });

        it('does not show queued message when user submits online with DEW policy', async () => {
            // Given a report is submitted while online on a DEW policy, which does NOT create an optimistic SUBMITTED action
            const policyID = 'dewTestPolicyOnline';
            const reportID = 'dewTestReportOnline';
            const accountID1 = 1;
            const accountID2 = 2;
            const expectedLastMessage = 'Expense for lunch meeting';
            const policy: Policy = {
                id: policyID,
                name: 'DEW Test Policy',
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            } as Policy;
            const report: Report = {
                reportID,
                reportName: 'DEW Test Report',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                lastMessageText: expectedLastMessage,
                participants: {[accountID1]: {notificationPreference: 'always'}, [accountID2]: {notificationPreference: 'always'}},
            };
            const commentAction: ReportAction = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2024-01-01 00:00:00',
                message: [{type: 'COMMENT', text: expectedLastMessage, html: expectedLastMessage}],
            };
            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [commentAction.reportActionID]: commentAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                });
            });

            // When the LHNOptionsList is rendered
            render(getLHNOptionsListElement({data: [report]}));

            // Then the queued message should NOT appear because the server processes DEW submissions immediately when online
            const reportItem = await waitFor(() => getReportItem(reportID));
            expect(reportItem).toBeTruthy();
            await waitFor(() => {
                expect(screen.queryByText('queued to submit via custom approval workflow')).toBeNull();
                expect(screen.getByText(expectedLastMessage)).toBeTruthy();
            });
        });
    });
});
