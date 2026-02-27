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
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const en: Record<string, unknown> = require('@src/languages/en').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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

    describe('LHN avatar rendering', () => {
        const accountID1 = 1;
        const accountID2 = 2;

        const twoParticipants = {[accountID1]: {notificationPreference: 'always' as const}, [accountID2]: {notificationPreference: 'always' as const}};

        const personalDetailsList = {
            [accountID1]: {accountID: accountID1, login: 'user1@test.com', displayName: 'User One', avatar: 'https://example.com/avatar1.png'},
            [accountID2]: {accountID: accountID2, login: 'user2@test.com', displayName: 'User Two', avatar: 'https://example.com/avatar2.png'},
        };

        // SUBSCRIPT cases

        it('should render subscript avatar for policy expense chat', async () => {
            const policyID = 'avatarPolicyExpense';
            const reportID = 'avatarPolicyExpenseReport';
            const policy: Policy = {
                id: policyID,
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const report: Report = {
                reportID,
                reportName: 'Policy Expense Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                isOwnPolicyExpenseChat: false,
                ownerAccountID: accountID1,
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            });

            render(getLHNOptionsListElement({data: [report]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        it('should render subscript avatar for expense report', async () => {
            const policyID = 'avatarExpenseReportPolicy';
            const chatReportID = 'avatarExpenseChatReport';
            const expenseReportID = 'avatarExpenseReport';
            const policy: Policy = {
                id: policyID,
                name: 'Expense Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const chatReport: Report = {
                reportID: chatReportID,
                reportName: 'Expense Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                isOwnPolicyExpenseChat: false,
                ownerAccountID: accountID1,
                participants: twoParticipants,
            };
            const expenseReport: Report = {
                reportID: expenseReportID,
                reportName: 'Expense Report',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                chatReportID,
                ownerAccountID: accountID1,
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);
            });

            render(getLHNOptionsListElement({data: [expenseReport]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        it('should render subscript avatar for invoice room with individual receiver', async () => {
            const policyID = 'avatarInvoiceIndivPolicy';
            const reportID = 'avatarInvoiceIndivReport';
            const policy: Policy = {
                id: policyID,
                name: 'Invoice Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const report: Report = {
                reportID,
                reportName: 'Invoice Room',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID,
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: accountID2},
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            });

            render(getLHNOptionsListElement({data: [report]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        it('should render subscript avatar for invoice room with business receiver', async () => {
            const senderPolicyID = 'avatarInvoiceBizSender';
            const receiverPolicyID = 'avatarInvoiceBizReceiver';
            const reportID = 'avatarInvoiceBizReport';
            const senderPolicy: Policy = {
                id: senderPolicyID,
                name: 'Sender Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const receiverPolicy: Policy = {
                id: receiverPolicyID,
                name: 'Receiver Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const report: Report = {
                reportID,
                reportName: 'B2B Invoice Room',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID: senderPolicyID,
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: receiverPolicyID},
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${senderPolicyID}`, senderPolicy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${receiverPolicyID}`, receiverPolicy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            });

            render(getLHNOptionsListElement({data: [report]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        // SINGLE cases

        it('should render single avatar for 1:1 DM', async () => {
            const reportID = 'avatarDMReport';
            const report: Report = {
                reportID,
                reportName: 'DM Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            });

            render(getLHNOptionsListElement({data: [report]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-SingleAvatar')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        it('should render single avatar for self DM', async () => {
            const reportID = 'avatarSelfDMReport';
            const report: Report = {
                reportID,
                reportName: 'Self DM',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {[accountID1]: {notificationPreference: 'always'}},
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {accountID: accountID1, email: 'user1@test.com'});
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            });

            render(getLHNOptionsListElement({data: [report]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-SingleAvatar')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        it('should render single avatar for workspace thread', async () => {
            const policyID = 'avatarWsThreadPolicy';
            const parentReportID = 'avatarWsThreadParent';
            const threadReportID = 'avatarWsThreadReport';
            const policy: Policy = {
                id: policyID,
                name: 'Thread Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const parentReport: Report = {
                reportID: parentReportID,
                reportName: 'Workspace Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                policyID,
                participants: twoParticipants,
            };
            const threadReport: Report = {
                reportID: threadReportID,
                reportName: 'Thread in Workspace',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                policyID,
                parentReportID,
                parentReportActionID: 'parentAction1',
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, parentReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, threadReport);
            });

            render(getLHNOptionsListElement({data: [threadReport]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-SingleAvatar')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        it('should render single avatar for admin room', async () => {
            const policyID = 'avatarAdminRoomPolicy';
            const reportID = 'avatarAdminRoomReport';
            const policy: Policy = {
                id: policyID,
                name: 'Admin Room Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            } as Policy;
            const report: Report = {
                reportID,
                reportName: '#admins',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID,
                participants: twoParticipants,
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            });

            render(getLHNOptionsListElement({data: [report]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-SingleAvatar')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });

        // DIAGONAL/MULTIPLE case

        it('should render diagonal avatar for IOU report preview with multiple senders', async () => {
            const chatReportID = 'avatarIOUMultiChat';
            const iouReportID = 'avatarIOUMultiIOU';
            const chatReport: Report = {
                reportID: chatReportID,
                reportName: 'Personal Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: twoParticipants,
            };
            const iouReport: Report = {
                reportID: iouReportID,
                reportName: 'IOU Report',
                type: CONST.REPORT.TYPE.IOU,
                chatReportID,
                ownerAccountID: accountID1,
                managerID: accountID2,
                participants: twoParticipants,
                parentReportID: chatReportID,
                parentReportActionID: 'previewAction1',
            };
            const reportPreviewAction: ReportAction = {
                reportActionID: 'previewAction1',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-01-01 00:00:00',
                childReportID: iouReportID,
                message: [{type: 'COMMENT', text: 'Report preview'}],
                originalMessage: {},
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                    [reportPreviewAction.reportActionID]: reportPreviewAction,
                });
                await Onyx.merge(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                    [chatReportID]: {
                        [reportPreviewAction.reportActionID]: true,
                    },
                });
            });

            render(getLHNOptionsListElement({data: [iouReport]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
            });
        });

        it('should render diagonal avatar for IOU report with personal policy and two user avatars', async () => {
            const policyID = 'avatarIOUPersonalPolicy';
            const chatReportID = 'avatarIOUPersonalChat';
            const iouReportID = 'avatarIOUPersonalIOU';
            const policy: Policy = {
                id: policyID,
                name: 'Personal Policy',
                type: CONST.POLICY.TYPE.PERSONAL,
            } as Policy;
            const chatReport: Report = {
                reportID: chatReportID,
                reportName: 'Personal Chat',
                type: CONST.REPORT.TYPE.CHAT,
                policyID,
                participants: twoParticipants,
            };
            const iouReport: Report = {
                reportID: iouReportID,
                reportName: 'IOU Report',
                type: CONST.REPORT.TYPE.IOU,
                policyID,
                chatReportID,
                ownerAccountID: accountID1,
                managerID: accountID2,
                participants: twoParticipants,
                parentReportID: chatReportID,
                parentReportActionID: 'previewAction3',
            };
            const reportPreviewAction: ReportAction = {
                reportActionID: 'previewAction3',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-01-01 00:00:00',
                childReportID: iouReportID,
                message: [{type: 'COMMENT', text: 'Report preview'}],
                originalMessage: {},
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                    [reportPreviewAction.reportActionID]: reportPreviewAction,
                });
                await Onyx.merge(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                    [chatReportID]: {
                        [reportPreviewAction.reportActionID]: true,
                    },
                });
            });

            render(getLHNOptionsListElement({data: [iouReport]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
            });
        });

        // Contrast case

        it('should render single avatar for IOU report preview with single sender', async () => {
            const chatReportID = 'avatarIOUSingleChat';
            const iouReportID = 'avatarIOUSingleIOU';
            const chatReport: Report = {
                reportID: chatReportID,
                reportName: 'Personal Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: twoParticipants,
            };
            const iouReport: Report = {
                reportID: iouReportID,
                reportName: 'IOU Report',
                type: CONST.REPORT.TYPE.IOU,
                chatReportID,
                ownerAccountID: accountID1,
                managerID: accountID2,
                participants: twoParticipants,
                parentReportID: chatReportID,
                parentReportActionID: 'previewAction2',
            };
            const reportPreviewAction: ReportAction = {
                reportActionID: 'previewAction2',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-01-01 00:00:00',
                childReportID: iouReportID,
                childOwnerAccountID: accountID1,
                message: [{type: 'COMMENT', text: 'Report preview'}],
                originalMessage: {},
            };

            mockUseIsFocused.mockReturnValue(true);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                    [reportPreviewAction.reportActionID]: reportPreviewAction,
                });
                await Onyx.merge(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
                    [chatReportID]: {
                        [reportPreviewAction.reportActionID]: true,
                    },
                });
            });

            render(getLHNOptionsListElement({data: [iouReport]}));

            await waitFor(() => {
                expect(screen.getByTestId('ReportActionAvatars-SingleAvatar')).toBeTruthy();
                expect(screen.queryByTestId('ReportActionAvatars-Subscript')).toBeNull();
                expect(screen.queryByTestId('ReportActionAvatars-MultipleAvatars')).toBeNull();
            });
        });
    });
});
