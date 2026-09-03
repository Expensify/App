import {act, render} from '@testing-library/react-native';

import ExpenseAddedGrowl from '@components/ExpenseAddedGrowl';
import type GrowlNotificationContent from '@components/GrowlNotification/GrowlNotificationContent';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {navigateToCreatedExpense} from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import {getOriginalMessage} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {ComponentProps} from 'react';

import Onyx from 'react-native-onyx';

import {actionR14932} from '../../__mocks__/reportData/actions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type GrowlContentProps = ComponentProps<typeof GrowlNotificationContent>;

const mockGetTopmostReportId = jest.fn<string | undefined, []>();

const mockGrowlContent = jest.fn<void, [GrowlContentProps]>();
jest.mock('@components/GrowlNotification/GrowlNotificationContent', () => (props: GrowlContentProps) => {
    mockGrowlContent(props);
    return null;
});

jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: () => mockGetTopmostReportId(),
    getActiveRoute: () => '',
}));
jest.mock('@libs/Navigation/helpers/navigateAfterExpenseCreate', () => ({
    navigateToCreatedExpense: jest.fn(),
}));
jest.mock('@libs/actions/Report', () => ({
    createTransactionThreadReport: jest.fn(),
    setOptimisticTransactionThread: jest.fn(),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, login: 'me@example.com'}));

const mockCreateTransactionThreadReport = jest.mocked(createTransactionThreadReport);
const mockSetOptimisticTransactionThread = jest.mocked(setOptimisticTransactionThread);
const mockNavigateToCreatedExpense = jest.mocked(navigateToCreatedExpense);

const EXPENSE = CONST.SEARCH.DATA_TYPES.EXPENSE;
const INVOICE = CONST.SEARCH.DATA_TYPES.INVOICE;

function flush(mutate: () => unknown) {
    return act(async () => {
        await mutate();
        await waitForBatchedUpdates();
    });
}

function seedExpense(transactionID: string, reportID: string, dataType: SearchDataTypes = EXPENSE) {
    return flush(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {transactionID, reportID});
        await Onyx.merge(ONYXKEYS.EXPENSE_ADDED_GROWL_TRANSACTION_IDS, {[transactionID]: dataType});
    });
}

function lastGrowlProps() {
    return mockGrowlContent.mock.calls.at(-1)?.[0];
}

describe('ExpenseAddedGrowl', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockCreateTransactionThreadReport.mockReset();
        mockGetTopmostReportId.mockReturnValue(undefined);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows the "Expense added" growl for a pending transaction when the user is not viewing its report', async () => {
        // Given the growl is mounted and the user is not viewing any report
        render(<ExpenseAddedGrowl />);

        // When an expense is created
        await seedExpense('1', 'report-1');

        // Then the "Expense added" success growl shows
        expect(mockGrowlContent).toHaveBeenCalled();
        expect(lastGrowlProps()?.bodyText).toBe('iou.expenseAdded');
        expect(lastGrowlProps()?.type).toBe(CONST.GROWL.SUCCESS);
        expect(lastGrowlProps()?.action?.label).toBe('common.view');
    });

    it('uses the invoice copy for an invoice', async () => {
        // Given the growl is mounted and the user is not viewing any report
        render(<ExpenseAddedGrowl />);

        // When an invoice is created
        await seedExpense('1', 'report-1', INVOICE);

        // Then the invoice copy is used instead of the expense one
        expect(lastGrowlProps()?.bodyText).toBe('iou.invoiceSent');
    });

    it("suppresses the growl when the user is already viewing the expense's report", async () => {
        // Given the user is already viewing report-1
        mockGetTopmostReportId.mockReturnValue('report-1');
        render(<ExpenseAddedGrowl />);

        // When an expense is created in that same report
        await seedExpense('1', 'report-1');

        // Then no growl shows, because the report already highlights the new expense
        expect(mockGrowlContent).not.toHaveBeenCalled();
    });

    it('still shows for a tracked/unreported (self-DM) expense even when a report is open, since its reportID is UNREPORTED', async () => {
        // Given the user is viewing some report
        mockGetTopmostReportId.mockReturnValue('some-open-report');
        render(<ExpenseAddedGrowl />);

        // When a tracked expense is created, which has no report to be viewed in
        await seedExpense('1', CONST.REPORT.UNREPORTED_REPORT_ID);

        // Then the growl still shows
        expect(mockGrowlContent).toHaveBeenCalled();
    });

    it('shows a single growl for a batch of new expenses and clears the whole signal', async () => {
        // Given the growl is mounted
        render(<ExpenseAddedGrowl />);

        // When two expenses are created in the same batch
        await flush(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {transactionID: '1', reportID: 'report-1'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {transactionID: '2', reportID: 'report-1'});
            const signal: Record<string, SearchDataTypes> = {};
            signal['1'] = EXPENSE;
            signal['2'] = EXPENSE;
            await Onyx.merge(ONYXKEYS.EXPENSE_ADDED_GROWL_TRANSACTION_IDS, signal);
        });

        // Then exactly one growl shows for the batch
        expect(mockGrowlContent).toHaveBeenCalledTimes(1);

        // And the whole signal is consumed so it can't re-fire
        const remaining = await new Promise<Record<string, SearchDataTypes> | undefined>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.EXPENSE_ADDED_GROWL_TRANSACTION_IDS,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
        expect(remaining ?? {}).toEqual({});
    });

    it('shows the next queued expense after dismissal and ignores a stale dismissal', async () => {
        // Given one growl is active and another expense is queued
        render(<ExpenseAddedGrowl />);
        await seedExpense('1', 'report-1');
        const firstGrowl = lastGrowlProps();
        expect(firstGrowl).toBeDefined();

        await seedExpense('2', 'report-2');
        expect(lastGrowlProps()?.nonce).toBe(firstGrowl?.nonce);

        // When the active growl is dismissed
        await flush(() => firstGrowl?.onDismissed(firstGrowl.nonce));
        const secondGrowl = lastGrowlProps();

        // Then the queued expense is shown
        expect(secondGrowl?.nonce).toBeGreaterThan(firstGrowl?.nonce ?? 0);

        // When the old growl reports another, stale dismissal and a third expense is queued
        await flush(() => firstGrowl?.onDismissed(firstGrowl.nonce));
        await seedExpense('3', 'report-3');

        // Then the current growl remains active until its own dismissal
        expect(lastGrowlProps()?.nonce).toBe(secondGrowl?.nonce);
        await flush(() => secondGrowl?.onDismissed(secondGrowl.nonce));
        expect(lastGrowlProps()?.nonce).toBeGreaterThan(secondGrowl?.nonce ?? 0);
    });

    it('navigates to an existing transaction thread when View is pressed', async () => {
        // Given an expense already has a transaction thread
        render(<ExpenseAddedGrowl />);
        await flush(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {
                transactionID: '1',
                reportID: 'report-1',
                transactionThreadReportID: 'thread-1',
            });
            const signal: Record<string, SearchDataTypes> = {};
            signal['1'] = EXPENSE;
            await Onyx.merge(ONYXKEYS.EXPENSE_ADDED_GROWL_TRANSACTION_IDS, signal);
        });

        // When View is pressed
        lastGrowlProps()?.action?.onPress();

        // Then the existing thread is initialized and opened without creating a replacement
        expect(mockSetOptimisticTransactionThread).toHaveBeenCalledWith('thread-1', undefined, undefined, undefined);
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
        expect(mockNavigateToCreatedExpense).toHaveBeenCalledWith({threadReportID: 'thread-1', transactionID: '1', iouReportID: undefined});
    });

    it('resolves an existing transaction thread from the IOU action when View is pressed', async () => {
        // Given the transaction thread is recorded on its IOU action
        const transactionID = getOriginalMessage(actionR14932)?.IOUTransactionID;
        if (!transactionID) {
            throw new Error('Expected the IOU action fixture to contain a transaction ID');
        }
        const reportID = actionR14932.reportID;
        render(<ExpenseAddedGrowl />);
        await flush(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {transactionID, reportID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[actionR14932.reportActionID]: actionR14932});
            const signal: Record<string, SearchDataTypes> = {};
            signal[transactionID] = EXPENSE;
            await Onyx.merge(ONYXKEYS.EXPENSE_ADDED_GROWL_TRANSACTION_IDS, signal);
        });

        // When View is pressed
        lastGrowlProps()?.action?.onPress();

        // Then the IOU action's thread is initialized and opened
        expect(mockSetOptimisticTransactionThread).toHaveBeenCalledWith(actionR14932.childReportID, undefined, actionR14932.reportActionID, undefined);
        expect(mockCreateTransactionThreadReport).not.toHaveBeenCalled();
        expect(mockNavigateToCreatedExpense).toHaveBeenCalledWith({threadReportID: actionR14932.childReportID, transactionID, iouReportID: undefined});
    });

    it('creates and navigates to a transaction thread when View is pressed without an existing thread', async () => {
        // Given an expense does not have a transaction thread yet
        mockCreateTransactionThreadReport.mockReturnValue({reportID: 'created-thread'});
        render(<ExpenseAddedGrowl />);
        await seedExpense('1', 'report-1');

        // When View is pressed
        lastGrowlProps()?.action?.onPress();

        // Then a thread is created from the current expense data and opened
        expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(
            expect.objectContaining({
                currentUserLogin: 'me@example.com',
                currentUserAccountID: 1,
                transaction: expect.objectContaining({transactionID: '1', reportID: 'report-1'}),
            }),
        );
        expect(mockSetOptimisticTransactionThread).not.toHaveBeenCalled();
        expect(mockNavigateToCreatedExpense).toHaveBeenCalledWith({threadReportID: 'created-thread', transactionID: '1', iouReportID: undefined});
    });

    it('does not show a growl when there is no pending signal', () => {
        // Given no expense was created
        // When the growl mounts
        render(<ExpenseAddedGrowl />);

        // Then the growl doesn't show
        expect(mockGrowlContent).not.toHaveBeenCalled();
    });
});
