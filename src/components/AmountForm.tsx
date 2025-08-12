import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencyDecimals, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import NumberWithSymbolForm from './NumberWithSymbolForm';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

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

    /** Custom label for the TextInput */
    label?: string;

    /** Whether the form should use a standard TextInput as a base */
    displayAsTextInput?: boolean;

    /** Number of decimals to display */
    decimals?: number;

    /** Whether to hide the currency symbol */
    hideCurrencySymbol?: boolean;
} & Pick<BaseTextInputProps, 'autoFocus' | 'autoGrowExtraSpace' | 'autoGrowMarginSide'>;

/**
 * Wrapper around NumberWithSymbolForm with currency handling.
 */
function AmountForm(
    {
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
        autoFocus,
        autoGrowExtraSpace,
        autoGrowMarginSide,
    }: AmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const decimals = decimalsProp ?? getCurrencyDecimals(currency);

    return (
        <NumberWithSymbolForm
            label={label}
            value={value}
            decimals={decimals}
            displayAsTextInput={displayAsTextInput}
            onInputChange={onInputChange}
            onSymbolButtonPress={onCurrencyButtonPress}
            ref={(ref: BaseTextInputRef) => {
                if (typeof forwardedRef === 'function') {
                    forwardedRef(ref);
                } else if (forwardedRef && 'current' in forwardedRef) {
                    // eslint-disable-next-line no-param-reassign
                    forwardedRef.current = ref;
                }
            }}
            symbol={getLocalizedCurrencySymbol(currency) ?? ''}
            symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
            isSymbolPressable={isCurrencyPressable}
            hideSymbol={hideCurrencySymbol}
            maxLength={amountMaxLength}
            errorText={errorText}
            style={displayAsTextInput ? undefined : styles.iouAmountTextInput}
            containerStyle={displayAsTextInput ? undefined : styles.iouAmountTextInputContainer}
            touchableInputWrapperStyle={displayAsTextInput ? undefined : styles.heightUndefined}
            autoFocus={autoFocus}
            autoGrowExtraSpace={autoGrowExtraSpace}
            autoGrowMarginSide={autoGrowMarginSide}
        />
    );
}

AmountForm.displayName = 'AmountForm';

export default forwardRef(AmountForm);
export type {AmountFormProps};
