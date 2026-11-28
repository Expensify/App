import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';
import type usePayViaABA from '@hooks/usePayViaABA';

import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockPayReportsViaABA = jest.fn<void, Parameters<ReturnType<typeof usePayViaABA>['payReportsViaABA']>>();
jest.mock('@hooks/usePayViaABA', () => ({__esModule: true, default: jest.fn(() => ({payReportsViaABA: mockPayReportsViaABA, isDownloadingABAFile: false}))}));

jest.mock('@userActions/IOU/PayMoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/PayMoneyRequest'),
    payMoneyRequest: jest.fn(),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

const policy: Policy = {...createRandomPolicy(1), id: 'ABAPolicy'};
const chatReport = {reportID: '200', type: CONST.REPORT.TYPE.CHAT, policyID: policy.id} as Report;
const expenseReport = {reportID: '100', chatReportID: chatReport.reportID, type: CONST.REPORT.TYPE.EXPENSE, policyID: policy.id} as Report;

const STORED_BANK_ACCOUNT_ID = 12345;
const STORED_BANK_ACCOUNT_LIST = {[STORED_BANK_ACCOUNT_ID]: {methodID: STORED_BANK_ACCOUNT_ID, accountData: {bankAccountID: STORED_BANK_ACCOUNT_ID}}};
const STORED_OWNER_BILLING_GRACE_PERIOD_END = 1700000000;
const STORED_AMOUNT_OWED = 1500;
const STORED_USER_BILLING_GRACE_PERIOD_END_KEY = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}42` as const;
const STORED_USER_BILLING_GRACE_PERIOD_END = {value: 1700000001};
const STORED_INTRO_SELECTED = {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL};
const STORED_CONCIERGE_REPORT_ID = 'concierge1';
const STORED_CONCIERGE_CHAT = {reportID: STORED_CONCIERGE_REPORT_ID, reportName: 'Concierge'};

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>{children}</ComposeProviders>;
}

describe('useHoldMenuSubmit', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });
    });

    it.each([true, false])('pays via ABA with full set to %s when the report is paid via ABA', async (full) => {
        // Given the hold menu of a report that's paid via ABA
        const onClose = jest.fn();
        const onConfirm = jest.fn();
        const {result} = renderHook(
            () =>
                useHoldMenuSubmit({
                    moneyRequestReport: expenseReport,
                    chatReport,
                    requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    paymentMethod: CONST.PAYMENT_METHODS.ABA,
                    onClose,
                    onConfirm,
                }),
            {wrapper: Wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // When the user chooses whether to pay the held expenses too
        await act(async () => {
            await result.current.onSubmit(full);
        });

        // Then the ABA file is downloaded with that choice instead of marking the report as paid, and the menu closes
        expect(mockPayReportsViaABA).toHaveBeenCalledWith(
            [expect.objectContaining({reportID: expenseReport.reportID})],
            expect.objectContaining({id: policy.id}),
            expect.objectContaining({shouldReimburseHeldTransactions: full}),
        );
        expect(payMoneyRequest).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();

        // And the menu is only confirmed once the file has downloaded, so selection mode turns off and the paid animation plays only when the reports are paid
        expect(onConfirm).not.toHaveBeenCalled();
        act(() => mockPayReportsViaABA.mock.calls.at(0)?.[2]?.onPaid?.());
        expect(onConfirm).toHaveBeenCalledWith(full);
    });

    it('passes the stored bank accounts, billing data, onboarding state, intent and Concierge chat to the payment', async () => {
        // Given a report marked as paid elsewhere, and stored bank accounts, billing data, onboarding state, intent and Concierge chat with non-default values, which the payment's optimistic data is built from
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.BANK_ACCOUNT_LIST]: STORED_BANK_ACCOUNT_LIST,
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: STORED_OWNER_BILLING_GRACE_PERIOD_END,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: STORED_AMOUNT_OWED,
                [STORED_USER_BILLING_GRACE_PERIOD_END_KEY]: STORED_USER_BILLING_GRACE_PERIOD_END,
                [ONYXKEYS.NVP_INTRO_SELECTED]: STORED_INTRO_SELECTED,
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true, selfTourViewed: true},
                [ONYXKEYS.CONCIERGE_REPORT_ID]: STORED_CONCIERGE_REPORT_ID,
                [`${ONYXKEYS.COLLECTION.REPORT}${STORED_CONCIERGE_REPORT_ID}` as const]: STORED_CONCIERGE_CHAT,
            });
        });
        const {result} = renderHook(
            () =>
                useHoldMenuSubmit({
                    moneyRequestReport: expenseReport,
                    chatReport,
                    requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    onClose: jest.fn(),
                }),
            {wrapper: Wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // When the user pays only the expenses that aren't on hold
        await act(async () => {
            await result.current.onSubmit(false);
        });

        // Then the stored bank accounts, billing data, onboarding state, intent and Concierge chat still reach the payment
        expect(payMoneyRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                bankAccountList: STORED_BANK_ACCOUNT_LIST,
                ownerBillingGracePeriodEnd: STORED_OWNER_BILLING_GRACE_PERIOD_END,
                amountOwed: STORED_AMOUNT_OWED,
                userBillingGracePeriodEnds: {[STORED_USER_BILLING_GRACE_PERIOD_END_KEY]: STORED_USER_BILLING_GRACE_PERIOD_END},
                introSelected: STORED_INTRO_SELECTED,
                isSelfTourViewed: true,
                isTrackIntentUser: true,
                conciergeChat: STORED_CONCIERGE_CHAT,
            }),
        );
    });

    it('marks the report as paid elsewhere when it is not paid via ABA', async () => {
        // Given the hold menu of a report that's marked as paid elsewhere
        const {result} = renderHook(
            () =>
                useHoldMenuSubmit({
                    moneyRequestReport: expenseReport,
                    chatReport,
                    requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    onClose: jest.fn(),
                }),
            {wrapper: Wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // When the user pays only the expenses that aren't on hold
        await act(async () => {
            await result.current.onSubmit(false);
        });

        // Then it's paid the usual way, without an ABA file
        expect(payMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, full: false}));
        expect(mockPayReportsViaABA).not.toHaveBeenCalled();
    });
});
