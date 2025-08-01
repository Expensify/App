import React from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import AmountTextInput from '@components/AmountTextInput';
import CurrencySymbolButton from '@components/CurrencySymbolButton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {addLeadingZero, replaceAllDigits} from '@libs/MoneyRequestUtils';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import type BaseTextInputWithCurrencySymbolProps from './types';

function BaseTextInputWithCurrencySymbol(
    {
        selectedCurrencyCode,
        onCurrencyButtonPress = () => {},
        onChangeAmount = () => {},
        formattedAmount,
        placeholder,
        selection,
        onSelectionChange = () => {},
        onKeyPress = () => {},
        isCurrencyPressable = true,
        hideCurrencySymbol = false,
        extraSymbol,
        style,
        ...rest
    }: BaseTextInputWithCurrencySymbolProps,
    ref: React.ForwardedRef<BaseTextInputRef>,
) {
    const {fromLocaleDigit} = useLocalize();
    const currencySymbol = getLocalizedCurrencySymbol(selectedCurrencyCode);
    const styles = useThemeStyles();

    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    const setFormattedAmount = (text: string) => {
        const newAmount = addLeadingZero(replaceAllDigits(text, fromLocaleDigit));
        onChangeAmount(newAmount);
    };

    return (
        <>
            {!hideCurrencySymbol && (
                <CurrencySymbolButton
                    currencySymbol={currencySymbol ?? ''}
                    onCurrencyButtonPress={onCurrencyButtonPress}
                    isCurrencyPressable={isCurrencyPressable}
                />
            )}
            <AmountTextInput
                formattedAmount={formattedAmount}
                onChangeAmount={setFormattedAmount}
                placeholder={placeholder}
                ref={ref}
                selection={selection}
                onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                    onSelectionChange(event);
                }}
                onKeyPress={onKeyPress}
                style={[styles.pr1, style]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
            {extraSymbol}
        </>
    );
}

BaseTextInputWithCurrencySymbol.displayName = 'BaseTextInputWithCurrencySymbol';

export default React.forwardRef(BaseTextInputWithCurrencySymbol);
