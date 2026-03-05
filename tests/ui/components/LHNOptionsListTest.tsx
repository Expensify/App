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

// Mock dynamic imports that break without --experimental-vm-modules
jest.mock('@src/languages/IntlStore', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const en: Record<string, unknown> = require('@src/languages/en').default;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const flattenObject: (obj: Record<string, unknown>) => Record<string, unknown> = require('@src/languages/flattenObject').default;

    const cache = new Map<string, Record<string, unknown>>([['en', flattenObject(en)]]);

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: {
            getCurrentLocale: () => 'en',
            load: () => Promise.resolve(),
            get: (key: string, locale?: string) => {
                const translations = cache.get(locale ?? 'en');
                return translations?.[key] ?? null;
            },
        },
    };
});
jest.mock('@assets/emojis', () => ({
    importEmojiLocale: jest.fn(() => Promise.resolve()),
    getEmojiCodeWithSkinColor: jest.fn(),
}));
jest.mock('@libs/EmojiTrie', () => ({
    buildEmojisTrie: jest.fn(),
}));

// Mock the context menu
jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({
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
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                });

                await Onyx.merge(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                    [reportID]: {
                        [submittedAction.reportActionID]: true,
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
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
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                });

                await Onyx.merge(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                    [reportID]: {
                        [commentAction.reportActionID]: true,
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [commentAction.reportActionID]: commentAction,
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

    describe('Workspace thread avatar rendering', () => {
        it('should render a single avatar for a workspace thread (threadSuppression)', async () => {
            // Given a workspace thread in a policyAdmins room — isWorkspaceThread returns true,
            // so shouldReportShowSubscript is initially true, but threadSuppression in SidebarUtils
            // overrides it to false. The icons should be trimmed to 1 for SINGLE rendering.
            const policyID = 'threadTestPolicy';
            const parentReportID = 'threadParentReport';
            const reportID = 'threadTestReport';
            const accountID1 = 1;
            const accountID2 = 2;

            const policy: Policy = {
                id: policyID,
                name: 'Thread Test Policy',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;

            const parentReport: Report = {
                reportID: parentReportID,
                reportName: 'Admins Room',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID,
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const threadReport: Report = {
                reportID,
                reportName: 'Thread in Admins',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID,
                parentReportID,
                parentReportActionID: 'parentAction1',
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, threadReport);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [accountID1]: {accountID: accountID1, login: 'admin1@test.com', displayName: 'Admin One', avatar: 'admin1-avatar'},
                    [accountID2]: {accountID: accountID2, login: 'admin2@test.com', displayName: 'Admin Two', avatar: 'admin2-avatar'},
                });
            });

            // When the LHNOptionsList renders the workspace thread
            render(getLHNOptionsListElement({data: [threadReport]}));

            // Then it should render a single avatar, not a diagonal (multiple) avatar
            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-SingleAvatar')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });
    });

    describe('Expense request thread avatar rendering', () => {
        it('should render a subscript avatar for a workspace expense request thread', async () => {
            // Given an expense request thread (chat thread whose parent is an expense report
            // with a transaction action). Workspace expense request threads are excluded from
            // thread suppression, so this renders as a subscript avatar.
            const policyID = 'expReqPolicy';
            const parentReportID = 'expReqParentReport';
            const reportID = 'expReqThread';
            const parentActionID = 'expReqParentAction';
            const accountID1 = 1;
            const accountID2 = 2;

            const policy: Policy = {
                id: policyID,
                name: 'Expense Request Policy',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;

            const parentReport: Report = {
                reportID: parentReportID,
                reportName: 'Expense Report',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const parentAction: ReportAction = {
                reportActionID: parentActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '2024-01-01 00:00:00',
                message: [{type: 'COMMENT', text: 'expense'}],
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
            };

            const threadReport: Report = {
                reportID,
                reportName: 'Expense Request Thread',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: '' as Report['chatType'],
                policyID,
                parentReportID,
                parentReportActionID: parentActionID,
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, threadReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                    [parentActionID]: parentAction,
                });
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [accountID1]: {accountID: accountID1, login: 'user1@test.com', displayName: 'User One', avatar: 'user1-avatar'},
                    [accountID2]: {accountID: accountID2, login: 'user2@test.com', displayName: 'User Two', avatar: 'user2-avatar'},
                });
            });

            // When the LHNOptionsList renders the expense request thread
            render(getLHNOptionsListElement({data: [threadReport]}));

            // Then it should render a subscript avatar (workspace expense requests preserve subscript)
            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
            });
        });
    });

    describe('Task report avatar rendering', () => {
        it('should render a subscript avatar for a workspace task report (owner + workspace)', async () => {
            // Given a task report inside a workspace (chatType policyExpenseChat).
            // shouldReportShowSubscript returns true, and workspace tasks are excluded
            // from taskSuppression. The icons show subscript (Large User + Small Workspace).
            const policyID = 'taskTestPolicy';
            const parentReportID = 'taskParentReport';
            const reportID = 'taskTestReport';
            const accountID1 = 1;
            const accountID2 = 2;

            const policy: Policy = {
                id: policyID,
                name: 'Task Test Policy',
                type: CONST.POLICY.TYPE.CORPORATE,
            } as Policy;

            const parentReport: Report = {
                reportID: parentReportID,
                reportName: 'Workspace Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const taskReport: Report = {
                reportID,
                reportName: 'Workspace Task',
                type: CONST.REPORT.TYPE.TASK,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                parentReportID,
                parentReportActionID: 'taskParentAction1',
                ownerAccountID: accountID1,
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, taskReport);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [accountID1]: {accountID: accountID1, login: 'user1@test.com', displayName: 'User One', avatar: 'user1-avatar'},
                    [accountID2]: {accountID: accountID2, login: 'user2@test.com', displayName: 'User Two', avatar: 'user2-avatar'},
                });
            });

            // When the LHNOptionsList renders the task report
            render(getLHNOptionsListElement({data: [taskReport]}));

            // Then it should render a subscript avatar (Large User + Small Workspace)
            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
            });
        });
    });

    describe('Invoice report avatar rendering', () => {
        it('should render subscript avatar for an individual invoice report', async () => {
            // Given an invoice report whose parent is an invoice room with an individual receiver.
            // The LHN should show a subscript avatar (workspace + user).
            const policyID = 'invoiceTestPolicy';
            const invoiceRoomID = 'invoiceRoomReport';
            const invoiceReportID = 'invoiceTestReport';
            const accountID1 = 1;
            const accountID2 = 2;

            const invoicePolicy: Policy = {
                id: policyID,
                name: 'Invoice Test Policy',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;

            const invoiceRoom: Report = {
                reportID: invoiceRoomID,
                reportName: 'Invoice Room',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID,
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: accountID2},
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const invoiceReport: Report = {
                reportID: invoiceReportID,
                reportName: 'Invoice Report',
                type: CONST.REPORT.TYPE.INVOICE,
                policyID,
                chatReportID: invoiceRoomID,
                parentReportID: invoiceRoomID,
                ownerAccountID: accountID1,
                participants: {
                    [accountID1]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [accountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, invoicePolicy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoomID}`, invoiceRoom);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, invoiceReport);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [accountID1]: {accountID: accountID1, login: 'sender@test.com', displayName: 'Sender', avatar: 'sender-avatar'},
                    [accountID2]: {accountID: accountID2, login: 'receiver@test.com', displayName: 'Receiver', avatar: 'receiver-avatar'},
                });
            });

            // When the LHNOptionsList renders the invoice report
            render(getLHNOptionsListElement({data: [invoiceReport]}));

            // Then it should render a subscript avatar (workspace icon + user avatar)
            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
            });
        });
    });

    describe('IOU report avatar rendering', () => {
        it('should render diagonal avatars for an IOU report between two users', async () => {
            // Given an IOU report with two participants (owner + manager).
            // shouldShowSubscript is naturally false for IOU, so icons are not trimmed
            // and LHNAvatar renders DIAGONAL (two small user avatars).
            const policyID = 'iouTestPolicy';
            const reportID = 'iouTestReport';
            const ownerAccountID = 1;
            const managerAccountID = 2;

            const policy: Policy = {
                id: policyID,
                name: 'IOU Test Policy',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;

            const report: Report = {
                reportID,
                reportName: 'IOU Test Report',
                type: CONST.REPORT.TYPE.IOU,
                policyID,
                ownerAccountID,
                managerID: managerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [managerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [ownerAccountID]: {accountID: ownerAccountID, login: 'owner@test.com', displayName: 'Owner', avatar: 'owner-avatar'},
                    [managerAccountID]: {accountID: managerAccountID, login: 'manager@test.com', displayName: 'Manager', avatar: 'manager-avatar'},
                });
            });

            // When the LHNOptionsList renders the IOU report
            render(getLHNOptionsListElement({data: [report]}));

            // Then it should render diagonal (multiple) avatars
            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-SingleAvatar')).toBeNull();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
            });
        });
    });
});
