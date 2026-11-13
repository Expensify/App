import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';

import React from 'react';

import type {AmountEditingRef} from './AmountEditingController';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

import AmountFormField from './AmountFormField';
import KeypadAmountEditor from './KeypadAmountEditor';

type AmountFormProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /**
     * Currency of the amount, should be the currency name, not the currency code
     * e.g. "USD", "EUR", "GBP", not "$", "€", "£"
     */
    currency?: string;

    /** Error to display at the bottom of the component */
    errorText?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress?: () => void;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable?: boolean;

    /** Custom max amount length. It defaults to CONST.IOU.AMOUNT_MAX_LENGTH */
    amountMaxLength?: number;

    /** Label of the text input. On the keypad path it only sets the accessibility label, which defaults to the amount label. */
    label?: string;

    /** Whether the form should use a standard TextInput as a base */
    displayAsTextInput?: boolean;

    decimals?: number;
    hideCurrencySymbol?: boolean;

    /** When true, shows the trailing dropdown (same as currency picker in IOU amount flows) */
    shouldShowCurrencyButton?: boolean;

    /** Text on the trailing dropdown button. Use with `shouldShowCurrencyButton` when the suffix is not a currency code (e.g. duration unit). */
    currencyButtonLabel?: string;

    /** Accessibility label for the trailing dropdown */
    currencyButtonAccessibilityLabel?: string;

    /** Disables the text input. Ignored on the keypad path (when `displayAsTextInput` is false). */
    disabled?: boolean;

    ref?: ForwardedRef<BaseTextInputRef>;

    /** Reference to the number form for imperative updates */
    numberFormRef?: ForwardedRef<AmountEditingRef>;

    onSubmitEditing?: () => void;

    /** Callback when the input is focused */
    onFocus?: () => void;
} & Pick<BaseTextInputProps, 'autoFocus' | 'onBlur'>;

/**
 * Wrapper around the numeric form components with currency handling.
 */
function AmountForm({
    value,
    currency = CONST.CURRENCY.USD,
    amountMaxLength,
    errorText,
    onInputChange,
    onCurrencyButtonPress,
    displayAsTextInput = false,
    isCurrencyPressable = true,
    label,
    decimals: decimalsProp,
    hideCurrencySymbol = false,
    shouldShowCurrencyButton = false,
    currencyButtonLabel,
    currencyButtonAccessibilityLabel,
    disabled = false,
    autoFocus,
    onSubmitEditing,
    onFocus,
    onBlur,
    ref,
    numberFormRef,
}: AmountFormProps) {
    const {preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const decimals = decimalsProp ?? getCurrencyDecimals(currency);
    const symbol = getLocalizedCurrencySymbol(preferredLocale, currency) ?? '';

    if (displayAsTextInput) {
        const currencyButtonText = currencyButtonLabel ?? currency;

        return (
            <AmountFormField
                value={value ?? ''}
                onInputChange={onInputChange}
                decimals={decimals}
                maxLength={amountMaxLength}
                errorText={errorText}
                ref={numberFormRef}
            >
                <AmountFormField.Input
                    prefixCharacter={hideCurrencySymbol ? '' : symbol}
                    accessibilityLabel={label}
                    label={label}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onSubmitEditing={onSubmitEditing}
                    ref={ref}
                >
                    {shouldShowCurrencyButton && !!currencyButtonText && (
                        <AmountFormField.CurrencyPickerButton
                            currency={currencyButtonText}
                            accessibilityLabel={currencyButtonAccessibilityLabel}
                            onPress={onCurrencyButtonPress}
                            isDisabled={disabled}
                        />
                    )}
                </AmountFormField.Input>
            </AmountFormField>
        );
    }

    return (
        <KeypadAmountEditor
            ref={numberFormRef}
            value={value ?? ''}
            onInputChange={onInputChange}
            decimals={decimals}
            maxLength={amountMaxLength}
            errorText={errorText}
            // FormProvider and ScreenWrapper already apply the bottom safe area around this editor
            addBottomSafeAreaPadding={false}
            actions={
                isCurrencyPressable && !!currency ? (
                    <KeypadAmountEditor.CurrencyPickerButton
                        currency={currency}
                        onPress={onCurrencyButtonPress}
                    />
                ) : undefined
            }
        >
            {!hideCurrencySymbol && !!symbol && <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>}
            <KeypadAmountEditor.Input
                ref={ref}
                accessibilityLabel={label}
                autoGrowExtraSpace={0}
                autoFocus={autoFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                onSubmitEditing={onSubmitEditing}
            />
        </KeypadAmountEditor>
    );
}

export default AmountForm;
