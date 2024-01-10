import React from 'react';
import AmountTextInput from '@components/AmountTextInput';
import CurrencySymbolButton from '@components/CurrencySymbolButton';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import type {TextInputWithCurrencySymbolProps, TextInputWithCurrencySymbolPropsWithForwardedRef} from './types';

function BaseTextInputWithCurrencySymbol({
    forwardedRef,
    formattedAmount,
    onChangeAmount = () => {},
    onCurrencyButtonPress = () => {},
    placeholder,
    selectedCurrencyCode,
    selection,
    onSelectionChange = () => {},
    onKeyPress = () => {},
}: TextInputWithCurrencySymbolPropsWithForwardedRef) {
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
            ref={forwardedRef}
            selection={selection}
            onSelectionChange={(e) => {
                onSelectionChange(e);
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

const BaseTextInputWithCurrencySymbolWithRef = React.forwardRef((props: TextInputWithCurrencySymbolProps, ref: BaseTextInputRef) => (
    <BaseTextInputWithCurrencySymbol
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

export default BaseTextInputWithCurrencySymbolWithRef;
