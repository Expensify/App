/**
 * The tax amount of a saved expense, edited in place on the expense view with the input the create expense form uses.
 * The amount is saved when the input loses focus, through the same write the tax amount page uses.
 */
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import type {MoneyRequestUpdateParams} from '@hooks/useMoneyRequestUpdateParams';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionTaxAmount from '@hooks/useUpdateTransactionTaxAmount';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {getCalculatedTaxAmount} from '@libs/TransactionUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import useSavedAmountInput from './useSavedAmountInput';

type TaxAmountInputFieldProps = {
    /** Expense whose tax amount is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** What a save needs to recompute the expense's violations, read once by the expense view */
    updateParams: MoneyRequestUpdateParams;

    /** Policy the tax rate belongs to, which caps the tax amount */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Saved tax amount, unsigned and in the smallest currency unit */
    taxAmount: number;

    /** Currency of the expense */
    currency: string;

    /** Label of the input, which can carry the converted tax amount */
    label: string;
};

function TaxAmountInputField({transaction, updateParams, policy, taxAmount, currency, label}: TaxAmountInputFieldProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const {updateTaxAmount} = useUpdateTransactionTaxAmount({transactionID: transaction?.transactionID, updateParams, policy});

    const decimals = getCurrencyDecimals(currency);
    // The tax amount page caps the tax at what the expense's tax rate works out to, as the create form does.
    const maxTaxAmount = getCalculatedTaxAmount(policy, transaction, currency, decimals);
    const getAmountError = (newTaxAmount: number) => (newTaxAmount > maxTaxAmount ? translate('iou.error.invalidTaxAmount', convertToDisplayString(maxTaxAmount, currency)) : '');
    const {inputValue, inputError, inputKey, startEditing, applyTypedAmount, saveTypedAmount} = useSavedAmountInput({
        amount: taxAmount,
        decimals,
        getAmountError,
        onSave: updateTaxAmount,
    });

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <NumberWithSymbolForm
                key={inputKey}
                displayAsTextInput
                autoFocus={false}
                value={inputValue}
                decimals={decimals}
                currency={currency}
                symbol={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
                label={label}
                errorText={inputError}
                onInputChange={applyTypedAmount}
                onFocus={startEditing}
                onBlur={saveTypedAmount}
                shouldShowBigNumberPad={false}
            />
        </View>
    );
}

export default TaxAmountInputField;
