import FormHelpMessage from '@components/FormHelpMessage';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';

import {convertToBackendAmount, convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type AmountInputFieldProps = {
    /** Expense whose amount is edited */
    transactionID: string;

    /** Money request action of the expense, so the edit doesn't have to look it up */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** Saved amount as the expense displays it, signed and in the smallest currency unit */
    amount: number;

    /** Saved currency of the expense */
    currency: string;

    /** Label of the input, e.g. the amount with its expense type */
    label: string;

    /** Whether the amount may be negative */
    allowNegative: boolean;

    /** Explanatory message rendered below the input, e.g. the converted amount */
    hintText?: string;

    /** Violation message for the amount, shown while the user has no input error of their own */
    errorText?: string;

    /** Whether the field sits in the wide RHP, which the narrower currency picker has to dim */
    isInWideRHP?: boolean;
};

/** Reads the typed amount as a signed amount in the smallest currency unit, or `null` when nothing is typed */
function getBackendAmountFromInput(value: string): number | null {
    const cleanAmount = value.replace('-', '').trim();
    if (!cleanAmount) {
        return null;
    }
    const numericAmount = Number.parseFloat(cleanAmount);
    if (Number.isNaN(numericAmount)) {
        return null;
    }
    const absoluteBackendAmount = convertToBackendAmount(numericAmount);
    return value.startsWith('-') ? -absoluteBackendAmount : absoluteBackendAmount;
}

/**
 * The amount of a saved expense, edited in place with the same input the Create expense form uses. The amount is
 * saved when the input loses focus, and the currency as soon as one is picked.
 */
function AmountInputField({transactionID, parentReportAction, amount, currency, label, allowNegative, hintText = '', errorText = '', isInWideRHP = false}: AmountInputFieldProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {onEditAmount} = useTransactionInlineEdit({transactionID, linkedReportAction: parentReportAction});
    const currencyButtonRef = useRef<View>(null);

    const decimals = getCurrencyDecimals(currency);
    const savedValue = `${amount < 0 ? '-' : ''}${convertToFrontendAmountAsString(Math.abs(amount), decimals)}`;

    const [inputValue, setInputValue] = useState(savedValue);
    const [inputError, setInputError] = useState('');
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const isFocusedRef = useRef(false);
    // The input keeps what is typed in its own state, so it is remounted to show a saved value it didn't type
    const [resetCount, setResetCount] = useState(0);
    const [prevSavedValue, setPrevSavedValue] = useState(savedValue);
    if (savedValue !== prevSavedValue) {
        setPrevSavedValue(savedValue);
        setInputValue(savedValue);
    }

    const save = (newAmount: number, newCurrency: string) => {
        if (newAmount === amount && newCurrency === currency) {
            return;
        }
        onEditAmount(newAmount, newCurrency === currency ? undefined : newCurrency, setInputError);
    };

    const saveAmount = (value: string) => {
        const newAmount = getBackendAmountFromInput(value);
        // A cleared input has no amount to save, so it goes back to the saved one
        if (newAmount === null) {
            setInputValue(savedValue);
            setInputError('');
            setResetCount((count) => count + 1);
            return;
        }
        save(newAmount, currency);
    };

    const updateCurrency = (newCurrency: string) => {
        setIsCurrencyPickerVisible(false);
        save(getBackendAmountFromInput(inputValue) ?? amount, newCurrency);
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
                shouldKeepBackdropInNarrowPane={isInWideRHP}
            />
            <View style={[styles.mh5, styles.mv2]}>
                <NumberWithSymbolForm
                    key={`${savedValue}-${currency}-${resetCount}`}
                    displayAsTextInput
                    autoFocus={false}
                    value={inputValue}
                    decimals={decimals}
                    currency={currency}
                    symbol={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
                    label={label}
                    errorText={inputError || errorText}
                    onInputChange={(value) => {
                        setInputValue(value);
                        setInputError('');
                        // The flip button changes the sign without focusing the input, so that change is saved now
                        if (!isFocusedRef.current) {
                            saveAmount(value);
                        }
                    }}
                    onFocus={() => {
                        isFocusedRef.current = true;
                    }}
                    onBlur={() => {
                        isFocusedRef.current = false;
                        saveAmount(inputValue);
                    }}
                    allowNegativeInput={allowNegative}
                    shouldShowFlipButton={allowNegative}
                    shouldShowCurrencyButton
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
