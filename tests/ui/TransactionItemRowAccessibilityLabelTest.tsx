import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchColumnType} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useAnimatedHighlightStyle');

function buildTransaction(overrides: Partial<TransactionWithOptionalSearchFields>): TransactionWithOptionalSearchFields {
    return {...createRandomTransaction(1), pendingAction: null, transactionID: '1', reportID: '1', modifiedMerchant: '', ...overrides};
}

function renderRow(transactionItem: TransactionWithOptionalSearchFields, shouldUseNarrowLayout: boolean) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <TransactionItemRow
                transactionItem={transactionItem}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                isSelected={false}
                shouldShowTooltip={false}
                dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                onCheckboxPress={jest.fn()}
                shouldShowCheckbox
                checkboxSentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                columns={Object.values(CONST.SEARCH.TABLE_COLUMNS) as SearchColumnType[]}
                onArrowRightPress={jest.fn()}
            />
        </ComposeProviders>,
    );
}

describe('TransactionItemRow accessibility labels', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    it('names the checkbox after the merchant, so each row can be told apart', async () => {
        // Given an expense with a merchant
        const transaction = buildTransaction({merchant: 'Audit Cafe'});

        // When the row renders in the narrow layout with its checkbox
        renderRow(transaction, true);
        await waitForBatchedUpdates();

        // Then the checkbox is named after the merchant instead of its role
        expect(screen.getByLabelText('Audit Cafe')).toBeOnTheScreen();
        expect(screen.queryByLabelText(CONST.ROLE.CHECKBOX)).not.toBeOnTheScreen();
    });

    it('reads the description as plain text when the expense has no merchant', async () => {
        // Given an expense with no merchant and a description, which is stored as HTML
        const transaction = buildTransaction({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, comment: {comment: 'Lunch &amp; drinks'}});

        // When the row renders in the narrow layout with its checkbox
        renderRow(transaction, true);
        await waitForBatchedUpdates();

        // Then the checkbox label has no HTML entities, so screen readers do not read them out
        expect(screen.getByLabelText('Lunch & drinks')).toBeOnTheScreen();
    });

    it('falls back to Select when the expense has neither a merchant nor a description', async () => {
        // Given an expense with no merchant and no description
        const transaction = buildTransaction({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, comment: {comment: ''}});

        // When the row renders in the narrow layout with its checkbox
        renderRow(transaction, true);
        await waitForBatchedUpdates();

        // Then the checkbox still has a name that says what it does
        expect(screen.getByLabelText(translateLocal('common.select'))).toBeOnTheScreen();
    });

    it('names the arrow in the wide layout by the action it opens', async () => {
        // Given an expense with a merchant
        const transaction = buildTransaction({merchant: 'Audit Cafe'});

        // When the row renders in the wide layout with its arrow
        renderRow(transaction, false);
        await waitForBatchedUpdates();

        // Then the arrow says what it does, and the checkbox is named after the merchant
        expect(screen.getByLabelText(translateLocal('iou.viewDetails'))).toBeOnTheScreen();
        expect(screen.getByLabelText('Audit Cafe')).toBeOnTheScreen();
    });
});
