/**
 * The amount of a saved expense, edited in place on the expense view with the input the create expense form uses. The
 * amount is saved when the input loses focus and the currency as soon as one is picked, through the same write the
 * amount page uses.
 */
import FormHelpMessage from '@components/FormHelpMessage';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import type {DuplicateTransactionsAndViolations} from '@hooks/useDuplicateTransactionsAndViolations';
import useLocalize from '@hooks/useLocalize';
import type {MoneyRequestUpdateParams} from '@hooks/useMoneyRequestUpdateParams';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionAmount from '@hooks/useUpdateTransactionAmount';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {getBackendAmountFromInput, isValidMoneyRequestAmount, stripDecimalsFromAmount, validateAmount} from '@libs/MoneyRequestUtils';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import useSavedAmountInput from './useSavedAmountInput';

type AmountInputFieldProps = {
    /** Expense whose amount is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** What a save needs to recompute the expense's violations, read once by the expense view */
    updateParams: MoneyRequestUpdateParams;

    /** The expense's duplicates, whose violations a save can change, read once by the expense view */
    duplicates: DuplicateTransactionsAndViolations;

    /** Policy the tax of the new amount is worked out against */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Categories of `policy` */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Saved amount as the expense displays it, signed and in the smallest currency unit */
    amount: number;

    /** Saved currency of the expense */
    currency: string;

    /** Label of the input, e.g. the amount with its expense type */
    label: string;

    iouType: ValueOf<typeof CONST.IOU.TYPE>;

    /** Whether the amount may be negative */
    allowNegative: boolean;

    /** Whether the expense is between two people, which rules out a zero amount */
    isP2P: boolean;

    /** Whether the currency can be changed. Off for an unreported distance expense, whose rate sets it */
    isCurrencyEditable: boolean;

    /** Explanatory message rendered below the input, e.g. the converted amount */
    hintText?: string;

    /** Violation message for the amount, shown while the typed value has no error of its own */
    errorText?: string;
};

function AmountInputField({
    transaction,
    updateParams,
    duplicates,
    policy,
    policyCategories,
    amount,
    currency,
    label,
    iouType,
    allowNegative,
    isP2P,
    isCurrencyEditable,
    hintText = '',
    errorText = '',
}: AmountInputFieldProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {updateAmount} = useUpdateTransactionAmount({transaction, updateParams, duplicates, policy, policyCategories});
    const currencyButtonRef = useRef<View>(null);

    const decimals = getCurrencyDecimals(currency);
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    const getAmountError = (newAmount: number) => (isValidMoneyRequestAmount(newAmount, iouType, allowNegative, isP2P) ? '' : translate('iou.error.invalidAmount'));
    const {inputValue, inputError, inputKey, startEditing, applyTypedAmount, saveTypedAmount} = useSavedAmountInput({
        amount,
        decimals,
        getAmountError,
        onSave: (newAmount) => updateAmount(newAmount, currency),
    });

    const updateCurrency = (newCurrency: string) => {
        setIsCurrencyPickerVisible(false);
        if (newCurrency === currency) {
            return;
        }
        // The typed amount goes along with the currency, cut to the decimals the new currency has, the way the amount
        // page's input cuts it. A typed amount the field refused, or none at all, leaves the saved amount as it is.
        const newDecimals = getCurrencyDecimals(newCurrency);
        const typedAmountForCurrency = validateAmount(inputValue, newDecimals, undefined, allowNegative) ? inputValue : stripDecimalsFromAmount(inputValue);
        const typedAmount = inputError ? null : getBackendAmountFromInput(typedAmountForCurrency);
        updateAmount(typedAmount !== null && !getAmountError(typedAmount) ? typedAmount : amount, newCurrency);
    };

    return (
        <>
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={() => setIsCurrencyPickerVisible(false)}
                headerText={translate('common.selectCurrency')}
                value={currency}
                onInputChange={updateCurrency}
                launcherRef={currencyButtonRef}
            />
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
                    errorText={inputError || errorText}
                    onInputChange={applyTypedAmount}
                    onFocus={startEditing}
                    onBlur={saveTypedAmount}
                    allowNegativeInput={allowNegative}
                    shouldShowFlipButton={allowNegative}
                    shouldShowCurrencyButton={isCurrencyEditable}
                    shouldShowBigNumberPad={false}
                    onCurrencyButtonPress={() => setIsCurrencyPickerVisible(true)}
                    currencyButtonRef={currencyButtonRef}
                    shouldUseBorderlessButtons
                />
                {!!hintText && (
                    <FormHelpMessage
                        isError={false}
                        shouldShowRedDotIndicator={false}
                        message={hintText}
                    />
                )}
            </View>
        </>
    );
}

export default AmountInputField;
