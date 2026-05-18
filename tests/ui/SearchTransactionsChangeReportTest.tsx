import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {SelectedTransactions} from '@components/Search/types';
import SearchTransactionsChangeReport from '@pages/Search/SearchTransactionsChangeReport';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import {createExpenseReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Transaction', () => ({
    changeTransactionsReport: jest.fn(),
}));

const mockChangeTransactionsReport = jest.mocked(changeTransactionsReport);

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@hooks/useConditionalCreateEmptyReportConfirmation', () => () => ({
    handleCreateReport: jest.fn(),
}));

jest.mock('@hooks/useHasPerDiemTransactions', () => () => false);

jest.mock('@hooks/usePolicyForMovingExpenses', () => () => ({
    policyForMovingExpensesID: 'policy-1',
    shouldSelectPolicy: false,
}));

let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedTransactionIDs: string[] = [];

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedTransactionIDs: mockSelectedTransactionIDs,
    }),
    useSearchActionsContext: () => ({
        clearSelectedTransactions: jest.fn(),
    }),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: () => ({accountID: 1, email: 'test@example.com'}),
    usePersonalDetails: () => ({}),
}));

jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: () => false,
}));

type CapturedEditReportCommonProps = {
    selectReport: (item: {value: string; policyID?: string}) => void;
};

let capturedProps: CapturedEditReportCommonProps | undefined;

jest.mock('@pages/iou/request/step/IOURequestEditReportCommon', () => {
    return function MockIOURequestEditReportCommon(props: CapturedEditReportCommonProps) {
        capturedProps = props;
        return null;
    };
});

const SOURCE_REPORT_ID = 'source-report-1';
const DESTINATION_REPORT_ID = 'destination-report-1';
const POLICY_ID = 'policy-1';

describe('SearchTransactionsChangeReport', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        capturedProps = undefined;
        mockSelectedTransactions = {};
        mockSelectedTransactionIDs = [];
        mockChangeTransactionsReport.mockClear();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('forwards originalReport when all selected transactions share one source report', async () => {
        const sourceReport: Report = {
            ...createExpenseReport(6),
            reportID: SOURCE_REPORT_ID,
            policyID: POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            currency: CONST.CURRENCY.USD,
        };
        const destinationReport: Report = {
            ...createExpenseReport(7),
            reportID: DESTINATION_REPORT_ID,
            policyID: POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            currency: CONST.CURRENCY.USD,
        };
        const transaction: Transaction = {
            transactionID: 'txn-1',
            reportID: SOURCE_REPORT_ID,
            amount: -100,
            currency: CONST.CURRENCY.USD,
            created: '2023-10-01',
            modified: '2023-10-01',
        };

        mockSelectedTransactions = {
            [transaction.transactionID]: {
                reportID: SOURCE_REPORT_ID,
                transaction,
            },
        };
        mockSelectedTransactionIDs = [transaction.transactionID];

        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'test@example.com'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SOURCE_REPORT_ID}`, sourceReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${DESTINATION_REPORT_ID}`, destinationReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: 'Policy'});
        });
        await waitForBatchedUpdatesWithAct();

        render(<SearchTransactionsChangeReport />);
        await waitForBatchedUpdatesWithAct();

        act(() => {
            capturedProps?.selectReport({value: DESTINATION_REPORT_ID, policyID: POLICY_ID});
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockChangeTransactionsReport).toHaveBeenCalledWith(
            expect.objectContaining({
                newReport: destinationReport,
                originalReport: sourceReport,
            }),
        );
    });

    it('does not forward originalReport when selected transactions come from different source reports', async () => {
        const transactionOne: Transaction = {
            transactionID: 'txn-1',
            reportID: SOURCE_REPORT_ID,
            amount: -100,
            currency: CONST.CURRENCY.USD,
            created: '2023-10-01',
            modified: '2023-10-01',
        };
        const transactionTwo: Transaction = {
            transactionID: 'txn-2',
            reportID: 'other-source-report',
            amount: -50,
            currency: CONST.CURRENCY.USD,
            created: '2023-10-01',
            modified: '2023-10-01',
        };

        mockSelectedTransactions = {
            [transactionOne.transactionID]: {reportID: SOURCE_REPORT_ID, transaction: transactionOne},
            [transactionTwo.transactionID]: {reportID: 'other-source-report', transaction: transactionTwo},
        };
        mockSelectedTransactionIDs = [transactionOne.transactionID, transactionTwo.transactionID];

        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'test@example.com'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${DESTINATION_REPORT_ID}`, {
                ...createExpenseReport(7),
                reportID: DESTINATION_REPORT_ID,
                policyID: POLICY_ID,
            });
        });
        await waitForBatchedUpdatesWithAct();

        render(<SearchTransactionsChangeReport />);
        await waitForBatchedUpdatesWithAct();

        act(() => {
            capturedProps?.selectReport({value: DESTINATION_REPORT_ID, policyID: POLICY_ID});
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockChangeTransactionsReport).toHaveBeenCalledWith(
            expect.objectContaining({
                originalReport: undefined,
            }),
        );
    });
});
