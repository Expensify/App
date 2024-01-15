import React from 'react';
import type {NativeSyntheticEvent, TextInput, TextInputSelectionChangeEventData} from 'react-native';
import AmountTextInput from '@components/AmountTextInput';
import CurrencySymbolButton from '@components/CurrencySymbolButton';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import type TextInputWithCurrencySymbolProps from './types';

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
    }: TextInputWithCurrencySymbolProps,
    ref: React.ForwardedRef<TextInput>,
) {
    const {fromLocaleDigit} = useLocalize();
    const currencySymbol = CurrencyUtils.getLocalizedCurrencySymbol(selectedCurrencyCode);
    const isCurrencySymbolLTR = CurrencyUtils.isCurrencySymbolLTR(selectedCurrencyCode);

    const currencySymbolButton = (
        <CurrencySymbolButton
            currencySymbol={currencySymbol ?? ''}
            onCurrencyButtonPress={onCurrencyButtonPress}
        />
    );

    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    const setFormattedAmount = (text: string) => {
        const newAmount = MoneyRequestUtils.addLeadingZero(MoneyRequestUtils.replaceAllDigits(text, fromLocaleDigit));
        onChangeAmount(newAmount);
    };

    const amountTextInput = (
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
        />
    );

    if (isCurrencySymbolLTR) {
        return (
            <>
                {currencySymbolButton}
                {amountTextInput}
            </>
        );
    }

    return (
        <>
            {amountTextInput}
            {currencySymbolButton}
        </>
    );
}

BaseTextInputWithCurrencySymbol.displayName = 'BaseTextInputWithCurrencySymbol';

export default React.forwardRef(BaseTextInputWithCurrencySymbol);
