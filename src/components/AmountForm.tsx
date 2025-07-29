import type {ForwardedRef} from 'react';
import React, {forwardRef, useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencyDecimals} from '@libs/CurrencyUtils';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import NumberWithSymbolForm from './NumberWithSymbolForm';
import TextInput from './TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

type AmountFormProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Currency supplied by user */
    currency?: string;

    /** Tells how many extra decimal digits are allowed. Default is 0. */
    extraDecimals?: number;

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
    fixedDecimals?: number;

    /** Whether to hide the currency symbol */
    hideCurrencySymbol?: boolean;
} & Pick<BaseTextInputProps, 'autoFocus' | 'autoGrowExtraSpace' | 'autoGrowMarginSide' | 'style'>;
function AmountForm(
    {
        value: amount,
        currency = CONST.CURRENCY.USD,
        extraDecimals = 0,
        amountMaxLength,
        errorText,
        onInputChange,
        onCurrencyButtonPress,
        displayAsTextInput = false,
        isCurrencyPressable = true,
        label,
        fixedDecimals,
        hideCurrencySymbol = false,
        ...rest
    }: AmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {toLocaleDigit} = useLocalize();

    const decimals = fixedDecimals ?? getCurrencyDecimals(currency) + extraDecimals;
    const currentAmount = useMemo(() => (typeof amount === 'string' ? amount : ''), [amount]);

    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    const setFormattedAmount = (text: string) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = stripSpacesFromAmount(text);
        const replacedCommasAmount = replaceCommasWithPeriod(newAmountWithoutSpaces);
        const withLeadingZero = addLeadingZero(replacedCommasAmount);

        if (!validateAmount(withLeadingZero, decimals, amountMaxLength)) {
            return;
        }

        const strippedAmount = stripCommaFromAmount(withLeadingZero);
        onInputChange?.(strippedAmount);
    };

    const formattedAmount = replaceAllDigits(currentAmount, toLocaleDigit);

    if (displayAsTextInput) {
        return (
            <TextInput
                label={label}
                value={formattedAmount}
                onChangeText={setFormattedAmount}
                ref={(ref: BaseTextInputRef) => {
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(ref);
                    } else if (forwardedRef && 'current' in forwardedRef) {
                        // eslint-disable-next-line no-param-reassign
                        forwardedRef.current = ref;
                    }
                }}
                prefixCharacter={currency}
                prefixStyle={styles.colorMuted}
                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
                // See https://github.com/Expensify/App/issues/51868 for more information
                autoCapitalize="words"
                inputMode={CONST.INPUT_MODE.DECIMAL}
                errorText={errorText}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        );
    }

    return (
        <NumberWithSymbolForm
            value={currentAmount}
            decimals={decimals}
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
            symbol={currency}
            isSymbolPressable={isCurrencyPressable}
            hideSymbol={hideCurrencySymbol}
            style={[styles.iouAmountTextInput]}
            containerStyle={[styles.iouAmountTextInputContainer]}
            shouldShowBigNumberPad
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

AmountForm.displayName = 'AmountForm';

export default forwardRef(AmountForm);
export type {AmountFormProps};
