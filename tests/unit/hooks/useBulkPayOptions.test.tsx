import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useBulkPayOptions from '@hooks/useBulkPayOptions';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const expenseReport = {reportID: '100', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'ABAPolicy', currency: CONST.CURRENCY.AUD} as Report;

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>{children}</ComposeProviders>;
}

async function getBulkPayButtonOptions(shouldShowPayViaABAOption: boolean, {onlyShowPayElsewhere = false, hasMultipleCurrencies = false} = {}) {
    const {result} = renderHook(
        () =>
            useBulkPayOptions({
                selectedPolicyID: expenseReport.policyID,
                selectedReportID: expenseReport.reportID,
                selectedReport: expenseReport,
                currency: CONST.CURRENCY.AUD,
                formattedAmount: 'A$100.00',
                onlyShowPayElsewhere,
                hasMultipleCurrencies,
                shouldShowPayViaABAOption,
            }),
        {wrapper: Wrapper},
    );
    await waitForBatchedUpdatesWithAct();
    return result.current.bulkPayButtonOptions;
}

async function getPayViaABAOption(shouldShowPayViaABAOption: boolean) {
    const bulkPayButtonOptions = await getBulkPayButtonOptions(shouldShowPayViaABAOption);
    return bulkPayButtonOptions?.find((option) => option.key === CONST.PAYMENT_METHODS.ABA);
}

describe('useBulkPayOptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('offers paying via ABA, marked so bulk pay knows to download the ABA file', async () => {
        // Given a selection that can be paid via ABA
        const shouldShowPayViaABAOption = true;

        // When the bulk pay options are built
        const payViaABAOption = await getPayViaABAOption(shouldShowPayViaABAOption);

        // Then "Pay via ABA" is offered, and picking it tells bulk pay to pay via ABA
        expect(payViaABAOption?.additionalData).toEqual({paymentMethod: CONST.PAYMENT_METHODS.ABA});
        expect(payViaABAOption?.disabled).toBe(false);
    });

    it('does not offer paying via ABA when the selection cannot be paid via ABA', async () => {
        // Given a selection that can't be paid via ABA, e.g. from more than one workspace
        const shouldShowPayViaABAOption = false;

        // When the bulk pay options are built
        const payViaABAOption = await getPayViaABAOption(shouldShowPayViaABAOption);

        // Then "Pay via ABA" isn't offered
        expect(payViaABAOption).toBeUndefined();
    });

    it('disables paying via ABA while offline', async () => {
        // Given the user is offline
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });

        // When the bulk pay options are built for a selection that can be paid via ABA
        const payViaABAOption = await getPayViaABAOption(true);

        // Then the option is disabled, since the ABA file can only be downloaded while online
        expect(payViaABAOption?.disabled).toBe(true);
    });

    it('still offers paying via ABA when the reports are in different currencies', async () => {
        // Given reports in different currencies that can be paid via ABA
        const options = {hasMultipleCurrencies: true};

        // When the bulk pay options are built
        const bulkPayButtonOptions = await getBulkPayButtonOptions(true, options);

        // Then only paying via ABA and marking as paid are offered, since an ABA file pays every report in AUD but a bank account pays in one currency
        expect(bulkPayButtonOptions?.map((option) => option.key)).toEqual([CONST.PAYMENT_METHODS.ABA, CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
    });

    it('only offers marking as paid when a report can only be marked as paid', async () => {
        // Given a selection with a report that can only be marked as paid, even though the workspace can pay via ABA
        const options = {onlyShowPayElsewhere: true, hasMultipleCurrencies: true};

        // When the bulk pay options are built
        const bulkPayButtonOptions = await getBulkPayButtonOptions(true, options);

        // Then only marking as paid is offered, since an ABA file can't pay that report either
        expect(bulkPayButtonOptions?.map((option) => option.key)).toEqual([CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
    });
});
