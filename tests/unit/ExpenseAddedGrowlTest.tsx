import {act, render} from '@testing-library/react-native';

import ExpenseAddedGrowl from '@components/ExpenseAddedGrowl';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type GrowlContentProps = {bodyText: string; type: string};

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

const EXPENSE = CONST.SEARCH.DATA_TYPES.EXPENSE;
const INVOICE = CONST.SEARCH.DATA_TYPES.INVOICE;

function flush(mutate: () => Promise<unknown>) {
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

    it('does not show a growl when there is no pending signal', () => {
        // Given no expense was created
        // When the growl mounts
        render(<ExpenseAddedGrowl />);

        // Then the growl doesn't show
        expect(mockGrowlContent).not.toHaveBeenCalled();
    });
});
