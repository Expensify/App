import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import EReceipt from '@components/EReceipt';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('EReceipt date', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows the transaction date on the day it was stored', async () => {
        // Given a transaction stored as a UTC calendar date
        const transaction: Transaction = {...createRandomTransaction(1), transactionID: '1', created: '2026-06-20', modifiedCreated: ''};

        // When its e-receipt is rendered
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <EReceipt
                    transactionID="1"
                    transactionItem={transaction}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the date reads as a long date on the stored day, matching the date shown on the expense itself
        expect(screen.getByText('June 20, 2026')).toBeOnTheScreen();
    });
});
