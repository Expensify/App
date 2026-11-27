import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import WiseQuoteConfirmModalWrapper from '@components/Modal/Global/WiseQuoteConfirmModalWrapper';
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

const report: Report = {
    reportID: '1',
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
    total: -15550,
    wiseQuoteRequest: {full: true, amount: 15550, bankAccountID: 1, hasResponse: false},
};

function renderModal(onConfirm: (wiseQuoteID: string | undefined) => void) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WiseQuoteConfirmModalWrapper
                closeModal={jest.fn()}
                resolveModal={jest.fn()}
                reportID={report.reportID}
                isPayingUnheldOnly={false}
                onConfirm={onConfirm}
                onQuoteExpired={jest.fn()}
            />
        </ComposeProviders>,
    );
}

function getLastModalProps() {
    return mockConfirmModalWrapper.mock.calls.at(-1)?.at(0);
}

describe('WiseQuoteConfirmModalWrapper', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockConfirmModalWrapper.mockClear();
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('keeps Pay disabled while the quote loads', async () => {
        // Given a quote request the server hasn't answered yet
        renderModal(jest.fn());
        await waitForBatchedUpdatesWithAct();

        // Then Pay stays disabled, since Wise requires the admin to see the quote first
        expect(getLastModalProps()?.isConfirmDisabled).toBe(true);
    });

    it('pays without a quote once the server answers that the payment needs none', async () => {
        // Given a quote request the server answered with no quote, because the payment doesn't go through Wise
        const onConfirm = jest.fn();
        renderModal(onConfirm);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {wiseQuoteRequest: {hasResponse: true}});
        await waitForBatchedUpdatesWithAct();

        // When the admin pays
        expect(getLastModalProps()?.isConfirmDisabled).toBe(false);
        getLastModalProps()?.closeModal({action: ModalActions.CONFIRM});

        // Then the report is paid without a quote instead of the modal staying open with Pay disabled
        expect(onConfirm).toHaveBeenCalledWith(undefined);
    });
});
