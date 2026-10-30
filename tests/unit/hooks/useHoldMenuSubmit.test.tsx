import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';

import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockPayReportsViaABA = jest.fn();
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
        const {result} = renderHook(
            () =>
                useHoldMenuSubmit({
                    moneyRequestReport: expenseReport,
                    chatReport,
                    requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    paymentMethod: CONST.PAYMENT_METHODS.ABA,
                    onClose,
                }),
            {wrapper: Wrapper},
        );
        await waitForBatchedUpdatesWithAct();

        // When the user chooses whether to pay the held expenses too
        result.current.onSubmit(full);

        // Then the ABA file is downloaded with that choice instead of marking the report as paid, and the menu closes
        expect(mockPayReportsViaABA).toHaveBeenCalledWith([expenseReport.reportID], expect.objectContaining({id: policy.id}), full);
        expect(payMoneyRequest).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
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
        result.current.onSubmit(false);

        // Then it's paid the usual way, without an ABA file
        expect(payMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, full: false}));
        expect(mockPayReportsViaABA).not.toHaveBeenCalled();
    });
});
