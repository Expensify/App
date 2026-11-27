import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';

import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, Transaction} from '@src/types/onyx';

import React, {Profiler} from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import {getCurrencyDecimalsLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => ({name: 'Report', key: 'Report', params: {}}),
}));

jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => (suffix: string) => suffix);

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

const SUBMITTER_ACCOUNT_ID = 31;
const APPROVER_ACCOUNT_ID = 32;
const UNRELATED_ACCOUNT_ID = 33;
const IOU_REPORT_ID = 'tp_pd_iou';
const TRANSACTION_ID = 'tp_pd_transaction';

const iouReport = {
    reportID: IOU_REPORT_ID,
    type: CONST.REPORT.TYPE.IOU,
    ownerAccountID: SUBMITTER_ACCOUNT_ID,
    managerID: APPROVER_ACCOUNT_ID,
    currency: CONST.CURRENCY.USD,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
} as Report;

const transaction = {
    transactionID: TRANSACTION_ID,
    reportID: IOU_REPORT_ID,
    amount: 5000,
    currency: CONST.CURRENCY.USD,
    created: '2026-11-20',
    merchant: 'Coffee Shop',
    comment: {},
} as Transaction;

const iouAction = buildOptimisticIOUReportAction({
    getCurrencyDecimals: getCurrencyDecimalsLocal,
    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    amount: 5000,
    currency: CONST.CURRENCY.USD,
    comment: '',
    participants: [],
    transactionID: TRANSACTION_ID,
    paymentType: undefined,
    iouReportID: IOU_REPORT_ID,
});

const personalDetails: PersonalDetailsList = {
    [SUBMITTER_ACCOUNT_ID]: {accountID: SUBMITTER_ACCOUNT_ID, login: 'submitter@test.com', displayName: 'Submitter'},
    [APPROVER_ACCOUNT_ID]: {accountID: APPROVER_ACCOUNT_ID, login: 'approver@test.com', displayName: 'Approver'},
    [UNRELATED_ACCOUNT_ID]: {accountID: UNRELATED_ACCOUNT_ID, login: 'unrelated@test.com', displayName: 'Unrelated'},
};

const onRender = jest.fn();

function renderTransactionPreview() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <Profiler
                id="TransactionPreview"
                onRender={onRender}
            >
                <TransactionPreview
                    action={iouAction}
                    chatReport={undefined}
                    reportID={IOU_REPORT_ID}
                    iouReportID={IOU_REPORT_ID}
                    transactionID={TRANSACTION_ID}
                    isBillSplit={false}
                    isTrackExpense={false}
                    transactionPreviewWidth={300}
                    shouldShowPayerAndReceiver
                    onPreviewPressed={() => {}}
                />
            </Profiler>
        </ComposeProviders>,
    );
}

describe('TransactionPreview personal details', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`, iouReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        onRender.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('updates the submitter and approver names when they change', async () => {
        // Given an expense card that shows who pays whom
        renderTransactionPreview();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Submitter')).toBeOnTheScreen();
        expect(screen.getByText('Approver')).toBeOnTheScreen();

        // When both people are renamed, which the card only hears through its narrowed subscription
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [SUBMITTER_ACCOUNT_ID]: {displayName: 'Renamed submitter'},
                [APPROVER_ACCOUNT_ID]: {displayName: 'Renamed approver'},
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the card shows the new names
        expect(screen.getByText('Renamed submitter')).toBeOnTheScreen();
        expect(screen.getByText('Renamed approver')).toBeOnTheScreen();
    });

    it('does not re-render when someone outside the expense is renamed', async () => {
        // Given an expense card that has finished rendering
        renderTransactionPreview();
        await waitForBatchedUpdatesWithAct();
        const commitsBeforeWrite = onRender.mock.calls.length;

        // When a person who is neither the submitter nor the approver is renamed, as happens constantly on large accounts
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[UNRELATED_ACCOUNT_ID]: {displayName: 'Renamed unrelated'}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the card doesn't commit again
        expect(onRender.mock.calls.length).toBe(commitsBeforeWrite);
    });
});
