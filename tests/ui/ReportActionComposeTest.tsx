import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ReportActionComposeProps} from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import ReportActionCompose from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/ComponentUtils', () => ({
    forceClearInput: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/usePaginatedReportActions', () => jest.fn(() => ({reportActions: [], hasNewerActions: false, hasOlderActions: false})));
jest.mock('@hooks/useParentReportAction', () => jest.fn(() => null));
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn(() => ({})));
jest.mock('@hooks/useShortMentionsList', () => jest.fn(() => ({availableLoginsList: []})));
jest.mock('@hooks/useSidePanelState', () => jest.fn(() => ({sessionStartTime: null})));

jest.mock('@components/DropZone/DualDropZone', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({shouldAcceptSingleReceipt}: {shouldAcceptSingleReceipt?: boolean}) => (
        <RN.Text testID="dual-drop-zone">{shouldAcceptSingleReceipt ? 'receipt-editable' : 'receipt-not-editable'}</RN.Text>
    );
});

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => {
        return jest.requireActual('@react-navigation/native');
    })(),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

TestHelper.setupGlobalFetchMock();

const defaultReport = LHNTestUtils.getFakeReport();
const defaultProps: ReportActionComposeProps = {
    reportID: defaultReport.reportID,
};

const renderReportActionCompose = (props?: Partial<ReportActionComposeProps>) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ReportActionCompose
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </ComposeProviders>,
    );
};

// Helper function to simulate text selection
const simulateSelection = (composer: ReturnType<typeof screen.getByTestId>, start: number, end: number) => {
    fireEvent(composer, 'selectionChange', {
        nativeEvent: {selection: {start, end}},
    });
};

describe('ReportActionCompose Integration Tests', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${defaultReport.reportID}`, defaultReport);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Paste Behavior with Selection updateComment logic', () => {
        it('should format pasted URL as Markdown link when text is selected', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected text');
            simulateSelection(composer, 0, 8);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected](https://example.com) text');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw URL when no text is selected', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, '');
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('https://example.com');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw text when non-URL text is pasted', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'what you do');
            simulateSelection(composer, 0, 4);
            const prevText = 'what you do';
            const pastedText = 'Hello world';
            const merged = prevText.slice(0, 0) + pastedText + prevText.slice(4);
            fireEvent.changeText(composer, merged);

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('Hello world you do');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when replacing entire selected text', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected text');
            simulateSelection(composer, 0, 13);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should insert raw URL with emoji when pasted with selection', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            const prevText = 'Emoji text 😀';
            fireEvent.changeText(composer, prevText);
            simulateSelection(composer, 0, 5);
            const pastedText = 'https://example.com 😀';
            const merged = prevText.slice(0, 0) + pastedText + prevText.slice(5);
            fireEvent.changeText(composer, merged);

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe(merged);
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains square brackets', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Select]ed[ text');
            simulateSelection(composer, 0, 15);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Select&#93;ed&#91; text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains parentheses', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selected () text');
            simulateSelection(composer, 0, 16);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selected () text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should format pasted URL as Markdown link when selected text contains curly braces', async () => {
            const {unmount} = renderReportActionCompose();
            await waitForBatchedUpdatesWithAct();

            const composer = screen.getByTestId('composer');
            fireEvent.changeText(composer, 'Selec}ted {text');
            simulateSelection(composer, 0, 15);
            fireEvent.changeText(composer, 'https://example.com');

            await waitFor(() => {
                expect(screen.getByTestId('composer').props.value).toBe('[Selec}ted {text](https://example.com)');
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Receipt edit check', () => {
        const currentUserAccountID = 1;
        const policyID = 'policy_receipt_test';
        const expenseReportID = 'expense_receipt_123';
        const parentReportActionID = 'parent_action_1';
        const transactionID = 'txn_receipt_test';

        const setupReceiptTestData = async (threadReport: {reportID: string; parentReportID?: string; parentReportActionID?: string}, isSettledReport = false) => {
            const threadReportID = threadReport.reportID;
            const iouReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                reportActionID: parentReportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                originalMessage: {
                    IOUReportID: expenseReportID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: transactionID,
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                },
            };

            const transaction = {
                transactionID,
                reportID: expenseReportID,
                amount: 100,
                currency: CONST.CURRENCY.USD,
                created: '2025-01-01',
                merchant: 'Test Merchant',
                comment: {},
            };

            await act(async () => {
                // Session so canEditFieldOfMoneyRequest knows the current user
                await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: 'test@test.com'});
                // Policy where the user is admin
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.ADMIN,
                    name: 'Test Policy',
                    owner: 'test@test.com',
                    outputCurrency: CONST.CURRENCY.USD,
                    isPolicyExpenseChatEnabled: true,
                });
                // Parent expense report (the IOUReportID in the action's originalMessage)
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {
                    reportID: expenseReportID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    policyID,
                    ownerAccountID: currentUserAccountID,
                    managerID: currentUserAccountID,
                    stateNum: isSettledReport ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: isSettledReport ? CONST.REPORT.STATUS_NUM.REIMBURSED : CONST.REPORT.STATUS_NUM.SUBMITTED,
                });
                // IOU report action on the parent expense report (needed for isTransactionThread + isExpenseRequest)
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`, {
                    [parentReportActionID]: iouReportAction,
                });
                // Also store the same action under the thread report ID so the component can find it via useOnyx
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`, {
                    [parentReportActionID]: iouReportAction,
                });
                // Thread report (so the component can self-subscribe via useOnyx)
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`, threadReport);
                // Transaction
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            });
            await waitForBatchedUpdatesWithAct();

            return transaction;
        };

        it('should display the receipt-editable dual drop zone when the user can edit the receipt', async () => {
            // Build a thread report that points to the parent expense report + parent IOU action
            // so isReportTransactionThread, canUserPerformWriteAction, and canEditFieldOfMoneyRequest all work with real data
            const threadReport = {
                ...LHNTestUtils.getFakeReport(),
                parentReportID: expenseReportID,
                parentReportActionID,
            };

            // Given real Onyx data where the user is admin and the report is open (not settled)
            await setupReceiptTestData(threadReport);

            // When rendering with the transaction thread report
            const {unmount} = renderReportActionCompose({
                reportID: threadReport.reportID,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the DualDropZone should be rendered because canEditFieldOfMoneyRequest returns true
            await waitFor(() => {
                expect(screen.getByTestId('dual-drop-zone')).toBeOnTheScreen();
                expect(screen.getByText('receipt-editable')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should not display the dual drop zone when the expense report is settled', async () => {
            const threadReport = {
                ...LHNTestUtils.getFakeReport(),
                parentReportID: expenseReportID,
                parentReportActionID,
            };

            // Given real Onyx data where the expense report is settled/reimbursed
            await setupReceiptTestData(threadReport, true);

            // When rendering with the transaction thread report
            const {unmount} = renderReportActionCompose({
                reportID: threadReport.reportID,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the DualDropZone should NOT be rendered because canEditFieldOfMoneyRequest returns false for settled reports
            expect(screen.queryByTestId('dual-drop-zone')).toBeNull();
            expect(screen.queryByText('receipt-editable')).toBeNull();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Message validation', () => {
        it('should not show exceeded length error for valid messages', async () => {
            const {unmount} = renderReportActionCompose();
            const composer = screen.getByTestId('composer');

            fireEvent.changeText(composer, 'x'.repeat(CONST.MAX_COMMENT_LENGTH));

            // Switch to fake timers to flush the debounced validation without real-time delay
            jest.useFakeTimers({doNotFake: ['nextTick']});
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME + 1);
            });
            jest.useRealTimers();

            expect(screen.queryByText('composer.commentExceededMaxLength')).not.toBeOnTheScreen();
            unmount();
        });

        it('should show exceeded length error for too-long messages', async () => {
            const {unmount} = renderReportActionCompose();
            const composer = screen.getByTestId('composer');

            fireEvent.changeText(composer, 'x'.repeat(CONST.MAX_COMMENT_LENGTH + 1));

            // The debounced validation fires on the trailing edge after COMMENT_LENGTH_DEBOUNCE_TIME
            await waitFor(
                () => {
                    expect(screen.getByText('composer.commentExceededMaxLength')).toBeOnTheScreen();
                },
                {timeout: CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME + 500},
            );

            unmount();
        });
    });
});
