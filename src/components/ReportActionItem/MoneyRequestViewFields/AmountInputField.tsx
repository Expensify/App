/**
 * The amount of a saved expense, edited in place on the expense view with the input the create expense form uses. The
 * amount is saved when the input loses focus and the currency as soon as one is picked, through the same write the
 * amount page uses.
 */
import FormHelpMessage from '@components/FormHelpMessage';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useMirroredInputValue from '@hooks/useMirroredInputValue';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionAmount from '@hooks/useUpdateTransactionAmount';

import {convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {getBackendAmountFromInput, isValidMoneyRequestAmount, stripDecimalsFromAmount, validateAmount} from '@libs/MoneyRequestUtils';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type AmountInputFieldProps = {
    /** Expense whose amount is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

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
    transactionThreadReport,
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
    const {updateAmount} = useUpdateTransactionAmount({transaction, transactionThreadReport, policy, policyCategories});
    const currencyButtonRef = useRef<View>(null);

    const decimals = getCurrencyDecimals(currency);
    const savedValue = `${amount < 0 ? '-' : ''}${convertToFrontendAmountAsString(Math.abs(amount), decimals)}`;
    const {inputValue, setInputValue, isFocused, startEditing, finishEditing} = useMirroredInputValue(savedValue);
    const [inputError, setInputError] = useState('');
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);

    // The input keeps what is typed in its own state, so it is remounted to show an amount the user didn't type.
    const [shownSavedValue, setShownSavedValue] = useState(savedValue);
    const [resetCount, setResetCount] = useState(0);
    if (!isFocused && shownSavedValue !== savedValue) {
        setShownSavedValue(savedValue);
        setInputError('');
    }

    const isValidAmount = (newAmount: number) => isValidMoneyRequestAmount(newAmount, iouType, allowNegative, isP2P);

    const showSavedAmount = () => {
        setInputValue(savedValue);
        setResetCount((count) => count + 1);
    };

    const saveAmount = (typedAmount: string) => {
        const newAmount = getBackendAmountFromInput(typedAmount);
        // An expense always has an amount, so a cleared input goes back to the saved one.
        if (newAmount === null) {
            setInputError('');
            showSavedAmount();
            return;
        }
        if (!isValidAmount(newAmount)) {
            setInputError(translate('iou.error.invalidAmount'));
            return;
        }
        setInputError('');
        if (newAmount === amount) {
            showSavedAmount();
            return;
        }
        updateAmount(newAmount, currency);
    };

    const saveTypedAmount = () => {
        const typedAmount = finishEditing();
        // Leaving the input untouched is not an edit, so it neither validates nor saves.
        if (typedAmount === undefined) {
            if (inputError) {
                setInputError('');
                showSavedAmount();
            }
            return;
        }
        saveAmount(typedAmount);
    };

    const applyTypedAmount = (typedAmount: string) => {
        setInputValue(typedAmount);
        setInputError('');
        // The flip button changes the sign without focusing the input, so that change has no blur to save it.
        if (!isFocused) {
            saveAmount(typedAmount);
        }
    };

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
        updateAmount(typedAmount !== null && isValidAmount(typedAmount) ? typedAmount : amount, newCurrency);
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
                    key={`${shownSavedValue}-${resetCount}`}
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
