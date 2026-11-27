import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import WiseQuoteCarouselModalWrapper from '@components/Modal/Global/WiseQuoteCarouselModalWrapper';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Modal/Global/ConfirmModalWrapper', () => jest.fn(() => null));

const mockConfirmModalWrapper = jest.mocked(ConfirmModalWrapper);

const QUOTED_REPORT_ID = '1';
const UNQUOTED_REPORT_ID = '2';
const quoteRequest = {full: true, amount: 15550, bankAccountID: 1, hasResponse: true};
const buildReport = (reportID: string): Report => ({reportID, type: CONST.REPORT.TYPE.EXPENSE, currency: CONST.CURRENCY.USD, total: -15550});

describe('WiseQuoteCarouselModalWrapper', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockConfirmModalWrapper.mockClear();
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('pays every report once each quote has loaded or the server answered that a report needs none', async () => {
        // Given two quoted reports, one with a quote, and one the server answered without a quote because its payment doesn't go through Wise
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${QUOTED_REPORT_ID}`, {
            wiseQuote: {
                wiseQuoteID: 'quote',
                fee: 412,
                rate: 0.8623,
                debitedAmount: 15962,
                creditedAmount: 13409,
                currency: CONST.CURRENCY.USD,
                paymentCurrency: CONST.CURRENCY.EUR,
                expectedDate: '2099-11-09',
                expiresAt: '2099-11-06T17:00:00Z',
            },
            wiseQuoteRequest: quoteRequest,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${UNQUOTED_REPORT_ID}`, {wiseQuoteRequest: quoteRequest});
        const onConfirm = jest.fn();
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
                <WiseQuoteCarouselModalWrapper
                    closeModal={jest.fn()}
                    resolveModal={jest.fn()}
                    reports={[buildReport(QUOTED_REPORT_ID), buildReport(UNQUOTED_REPORT_ID)]}
                    quotedReportIDs={[QUOTED_REPORT_ID, UNQUOTED_REPORT_ID]}
                    onConfirm={onConfirm}
                    onQuoteExpired={jest.fn()}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the admin pays all
        const modalProps = mockConfirmModalWrapper.mock.calls.at(-1)?.at(0);
        expect(modalProps?.isConfirmDisabled).toBe(false);
        modalProps?.closeModal({action: ModalActions.CONFIRM});

        // Then the quoted report is paid with its quote and the other one without
        expect(onConfirm).toHaveBeenCalledWith({[QUOTED_REPORT_ID]: 'quote'});
    });
});
