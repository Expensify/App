import {fireEvent, render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import DateField from '@components/MoneyRequestConfirmationList/sections/DateField';

import {updateDistanceRateOnExpenseDateChange} from '@libs/actions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';

let mockActiveTransaction: OnyxTypes.Transaction | undefined;
let mockOnyxValues: Record<string, unknown> = {};

jest.mock('@components/DatePicker', () => {
    const {Pressable, Text} = jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void}>>>('react-native');
    const MockDatePicker = ({onInputChange}: {onInputChange: (date: string) => void}) => (
        <Pressable
            onPress={() => onInputChange('2024-02-01')}
            accessibilityRole="button"
        >
            <Text>Pick new date</Text>
        </Pressable>
    );
    return MockDatePicker;
});
jest.mock(
    '@components/MoneyRequestConfirmationList/sections/useTransactionSelector',
    () => (_transactionID: string, selector: (transaction: OnyxTypes.Transaction | undefined) => unknown) => selector(mockActiveTransaction),
);
jest.mock('@hooks/useOnyx', () => (key: string) => [mockOnyxValues[key]]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));
jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@hooks/usePersonalPolicy', () => () => undefined);
jest.mock('@hooks/usePolicyForMovingExpenses', () => () => ({policyForMovingExpensesID: undefined}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    clearMoneyRequestCreated: jest.fn(),
    setMoneyRequestCreated: jest.fn(),
    updateDistanceRateOnExpenseDateChange: jest.fn(),
}));
jest.mock('@userActions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));

const dateFieldProps: React.ComponentProps<typeof DateField> = {
    shouldDisplayFieldError: false,
    didConfirm: false,
    isReadOnly: false,
    formError: '',
    transactionID: '1',
    action: CONST.IOU.ACTION.CREATE,
    iouType: CONST.IOU.TYPE.CREATE,
    reportID: '2',
    reportActionID: undefined,
};

describe('DateField create flow', () => {
    beforeEach(() => {
        mockOnyxValues = {};
    });

    it('recalculates the distance rate from the transaction draft when the date changes', () => {
        // Given a distance expense being created, whose fields live in the transaction draft
        mockActiveTransaction = {
            transactionID: '1',
            created: '2024-01-01',
            comment: {customUnit: {customUnitID: 'unit', customUnitRateID: 'rate'}},
        } as OnyxTypes.Transaction;

        render(
            <ConfirmationFieldsProvider
                transactionID="1"
                reportID="2"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.CREATE}
                isDistanceRequest
            >
                <DateField {...dateFieldProps} />
            </ConfirmationFieldsProvider>,
        );

        // When the user picks a date that belongs to a different distance rate's effective range
        fireEvent.press(screen.getByText('Pick new date'));

        // Then the rate is recalculated from the draft transaction, not from the saved one that doesn't exist yet
        expect(updateDistanceRateOnExpenseDateChange).toHaveBeenCalledWith(expect.objectContaining({transaction: mockActiveTransaction}));
    });
});
