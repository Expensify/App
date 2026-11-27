import {act, renderHook} from '@testing-library/react-native';

import {SearchTabHoldContext} from '@hooks/useSearchTabHold';
import type {SearchTabHold} from '@hooks/useSearchTabHold';
import useSearchTransactions from '@hooks/useSearchTransactions';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}1` as const;
const TRANSACTION: Transaction = {transactionID: '1', amount: 100, currency: 'USD', created: '2026-11-24', merchant: 'Original', reportID: '1', comment: {}};

// Set between renders to hold or release the tab. Each hold is a new object.
let searchTabHold: SearchTabHold | undefined;
function SearchTabWrapper({children}: ChildrenProps) {
    return <SearchTabHoldContext value={searchTabHold}>{children}</SearchTabHoldContext>;
}

function renderSearchTransactions() {
    let renderCount = 0;
    const rendered = renderHook(
        () => {
            renderCount++;
            return useSearchTransactions();
        },
        {wrapper: SearchTabWrapper},
    );
    return {...rendered, getRenderCount: () => renderCount};
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

describe('useSearchTransactions', () => {
    beforeEach(async () => {
        searchTabHold = undefined;
        await Onyx.clear();
        await Onyx.set(TRANSACTION_KEY, TRANSACTION);
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['shows the expense update while Search is shown', false, 'Edited', true],
        ['keeps the transactions it was built with while a hidden Spend tab is held', true, 'Original', false],
    ])('%s', async (_description, isHeld, expectedMerchant, shouldRender) => {
        // Given Search reading the transactions, in a shown tab or a hidden Spend tab that is held
        const {result, rerender, getRenderCount} = renderSearchTransactions();
        await waitForBatchedUpdatesWithAct();
        searchTabHold = isHeld ? createMock<SearchTabHold>({}) : undefined;
        rerender({});
        await waitForBatchedUpdatesWithAct();
        const renderCountBeforeUpdate = getRenderCount();

        // When an expense update changes a transaction
        await act(() => Onyx.merge(TRANSACTION_KEY, {merchant: 'Edited'}));
        await waitForBatchedUpdatesWithAct();

        // Then only a shown Search reads the update, so a held list has nothing to re-render
        expect(result.current.transactions?.[TRANSACTION_KEY]?.merchant).toBe(expectedMerchant);
        expect(getRenderCount() > renderCountBeforeUpdate).toBe(shouldRender);
    });

    it('catches up when the held tab is shown without reporting the catch-up as an expense update', async () => {
        // Given a held hidden Spend tab that missed an expense update
        searchTabHold = createMock<SearchTabHold>({});
        const {result, rerender} = renderSearchTransactions();
        await waitForBatchedUpdatesWithAct();
        await act(() => Onyx.merge(TRANSACTION_KEY, {merchant: 'Edited'}));
        await waitForBatchedUpdatesWithAct();

        // When the user opens the tab
        searchTabHold = undefined;
        rerender({});

        // Then Search renders the current transactions at once
        expect(result.current.transactions?.[TRANSACTION_KEY]?.merchant).toBe('Edited');

        // And the previous value matches them, so the auto refetch sees no change
        expect(result.current.previousTransactions).toBe(result.current.transactions);
    });

    it('holds the current transactions when a new hold starts, not the ones an earlier hold captured', async () => {
        // Given a hold that ended, followed by an expense update while the tab was not held
        searchTabHold = createMock<SearchTabHold>({});
        const {result, rerender} = renderSearchTransactions();
        await waitForBatchedUpdatesWithAct();
        searchTabHold = undefined;
        rerender({});
        await act(() => Onyx.merge(TRANSACTION_KEY, {merchant: 'Edited'}));
        await waitForBatchedUpdatesWithAct();

        // When a new hold starts, as when the hold captures the contexts of a new query
        searchTabHold = createMock<SearchTabHold>({});
        rerender({});

        // Then Search keeps the transactions from the start of the new hold, so the held list matches the results it holds
        expect(result.current.transactions?.[TRANSACTION_KEY]?.merchant).toBe('Edited');
    });
});
