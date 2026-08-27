import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import MoneyRequestReportTransactionsNavigation from '@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';

import * as ReportActions from '@libs/actions/Report';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: jest.fn(), unmarkReportRHPWidth: jest.fn()}),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: 'a@b.com', accountID: 1}),
}));

const IOU_REPORT_ID = 'iou1';
const FIRST_TRANSACTION_ID = 't1';
const SECOND_TRANSACTION_ID = 't2';

function buildTransaction(transactionID: string, index: number): Transaction {
    return {...createRandomTransaction(index), transactionID, reportID: IOU_REPORT_ID};
}

describe('MoneyRequestReportTransactionsNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        // The report's own actions are deliberately absent: this is the cache-cleared shape, where the
        // seeded sibling IDs are known but the IOU actions that resolve them have not been fetched yet.
        await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, [FIRST_TRANSACTION_ID, SECOND_TRANSACTION_ID]);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${FIRST_TRANSACTION_ID}`, buildTransaction(FIRST_TRANSACTION_ID, 0));
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${SECOND_TRANSACTION_ID}`, buildTransaction(SECOND_TRANSACTION_ID, 1));
        await waitForBatchedUpdates();
    });

    it('does not mint a thread or navigate when next is pressed before the report actions load', async () => {
        const createThreadSpy = jest.spyOn(ReportActions, 'createTransactionThreadReport');
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        // Both arrows render with the generic button role; the second one is next.
        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        expect(buttons).toHaveLength(2);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(createThreadSpy).not.toHaveBeenCalled();
        });
        expect(setParamsSpy).not.toHaveBeenCalled();
    });
});
