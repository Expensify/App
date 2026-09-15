import {render} from '@testing-library/react-native';

import MoneyRequestHeaderSecondaryActions from '@components/MoneyRequestHeaderSecondaryActions';
import type * as OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOnyx from '@hooks/useOnyx';

import {deleteTrackExpense} from '@libs/actions/IOU/TrackExpense';
import {getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

const TEST_REPORT_ID = '1001';
const TEST_PARENT_REPORT_ID = '2002';
const TEST_IOU_REPORT_ID = '3003';
const TEST_TRANSACTION_ID = '4004';
const TEST_PARENT_ACTION_ID = '5005';

const report: Report = {...createRandomReport(1), reportID: TEST_REPORT_ID, parentReportID: TEST_PARENT_REPORT_ID, parentReportActionID: TEST_PARENT_ACTION_ID};
const parentReport: Report = {...createRandomReport(2), reportID: TEST_PARENT_REPORT_ID};
const iouReport: Report = {...createRandomReport(3), reportID: TEST_IOU_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: TEST_PARENT_REPORT_ID};
const transaction: Transaction = {...createRandomTransaction(4), transactionID: TEST_TRANSACTION_ID, reportID: TEST_IOU_REPORT_ID};

const parentReportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
    ...createRandomReportAction(5),
    reportActionID: TEST_PARENT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    reportID: TEST_IOU_REPORT_ID,
    originalMessage: {
        IOUTransactionID: TEST_TRANSACTION_ID,
        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        amount: transaction.amount,
        currency: transaction.currency,
    },
    message: undefined,
    previousMessage: undefined,
};

// The transactions useReportTransactionsCollection resolves for the iouReport. Kept separate from `transaction`
// (the transaction thread's own transaction) so we can assert deleteTrackExpense receives exactly this set.
const mockIouReportTransactionsByKey: Record<string, Transaction> = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`]: transaction,
};

let mockCapturedDropdownOptions: Array<{value: string; onSelected: (this: void) => void}> = [];

jest.mock('@components/ButtonWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: {options: Array<{value: string; onSelected: (this: void) => void}>}) => {
        mockCapturedDropdownOptions = props.options;
        return null;
    },
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        showConfirmModal: jest.fn(() => Promise.resolve({action: 'CONFIRM'})),
    })),
}));

jest.mock('@hooks/useDeleteTransactions', () => ({
    __esModule: true,
    default: jest.fn(() => ({deleteTransactions: jest.fn(), shouldOpenSplitExpenseEditFlowOnDelete: jest.fn(() => false)})),
}));

jest.mock('@hooks/useReportTransactionsCollection', () => ({
    __esModule: true,
    default: jest.fn(() => mockIouReportTransactionsByKey),
}));

jest.mock('@libs/actions/IOU/TrackExpense', () => ({
    __esModule: true,
    deleteTrackExpense: jest.fn(),
}));

jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    __esModule: true,
    getSecondaryTransactionThreadActions: jest.fn(() => ['delete']),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: jest.fn(() => ({key: 'test-route', name: 'Report', params: {}})),
}));

jest.mock('@hooks/useOnyx', () => jest.fn());

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldNavigateToUpgradePath: false, policyForMovingExpenses: undefined})),
}));

jest.mock('@hooks/useSplitEffectivePolicy', () => ({
    __esModule: true,
    default: jest.fn(() => undefined),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    ...jest.requireActual<typeof OnyxListItemProvider>('@components/OnyxListItemProvider'),
    __esModule: true,
    usePersonalDetails: jest.fn(() => ({})),
}));

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedDeleteTrackExpense = jest.mocked(deleteTrackExpense);
const mockedGetSecondaryTransactionThreadActions = jest.mocked(getSecondaryTransactionThreadActions);

describe('MoneyRequestHeaderSecondaryActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedDropdownOptions = [];
        mockedGetSecondaryTransactionThreadActions.mockReturnValue([CONST.REPORT.SECONDARY_ACTIONS.DELETE]);
        mockedUseOnyx.mockImplementation((key: string) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_REPORT_ID}`) {
                return [report, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_PARENT_REPORT_ID}`) {
                return [parentReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_IOU_REPORT_ID}`) {
                return [iouReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_PARENT_REPORT_ID}`) {
                return [{[TEST_PARENT_ACTION_ID]: parentReportAction}, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`) {
                return [transaction, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('passes the iouReport transactions from useReportTransactionsCollection to deleteTrackExpense on delete', () => {
        render(
            <MoneyRequestHeaderSecondaryActions
                reportID={TEST_REPORT_ID}
                onBackButtonPress={() => {}}
            />,
        );

        const deleteOption = mockCapturedDropdownOptions.find((option) => option.value === CONST.REPORT.SECONDARY_ACTIONS.DELETE);
        expect(deleteOption).toBeTruthy();

        deleteOption?.onSelected();

        return new Promise<void>((resolve) => {
            process.nextTick(resolve);
        }).then(() => {
            expect(mockedDeleteTrackExpense).toHaveBeenCalledWith(expect.objectContaining({iouReportTransactions: Object.values(mockIouReportTransactionsByKey)}));
        });
    });
});
