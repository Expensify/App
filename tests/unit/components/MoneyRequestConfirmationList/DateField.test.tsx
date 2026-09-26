import {render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import DateField from '@components/MoneyRequestConfirmationList/sections/DateField';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import React from 'react';

import createRandomTransaction from '../../../utils/collections/transaction';

let mockTransaction: Transaction | undefined;

jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title}: {title: string}) => <Text>{title}</Text>;
});

jest.mock('@components/MoneyRequestConfirmationList/sections/useTransactionSelector', () => ({
    __esModule: true,
    default: (transactionID: string | undefined, selector: (transaction: Transaction | undefined) => unknown) => selector(mockTransaction),
}));

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'es'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@hooks/usePersonalPolicy', () => () => undefined);
jest.mock('@hooks/usePolicyForMovingExpenses', () => () => ({policyForMovingExpensesID: undefined}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));

function renderReadOnlyDateField() {
    render(
        <ConfirmationFieldsProvider
            transactionID="1"
            reportID="1"
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <DateField
                shouldDisplayFieldError={false}
                didConfirm={false}
                isReadOnly
                formError=""
                transactionID="1"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                reportID="1"
                reportActionID={undefined}
            />
        </ConfirmationFieldsProvider>,
    );
}

describe('DateField', () => {
    it('shows a read-only expense date in the reader language rather than as stored', () => {
        // Given an expense whose date is stored in the machine format
        mockTransaction = {...createRandomTransaction(1), created: '2026-09-03', modifiedCreated: ''};

        // When split bill details show the date row read-only to a Spanish reader
        renderReadOnlyDateField();

        // Then the row reads a Spanish date, because the read-only row used to print the stored value as is
        expect(screen.getByText('3 sept 2026')).toBeOnTheScreen();
        expect(screen.queryByText('2026-09-03')).not.toBeOnTheScreen();
    });
});
