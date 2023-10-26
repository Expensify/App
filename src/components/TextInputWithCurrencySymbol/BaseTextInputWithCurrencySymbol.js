import React from 'react';
import AmountTextInput from '../AmountTextInput';
import CurrencySymbolButton from '../CurrencySymbolButton';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import useLocalize from '../../hooks/useLocalize';
import * as MoneyRequestUtils from '../../libs/MoneyRequestUtils';
import * as textInputWithCurrencySymbolPropTypes from './textInputWithCurrencySymbolPropTypes';

function BaseTextInputWithCurrencySymbol(props) {
    const {fromLocaleDigit} = useLocalize();
    const currencySymbol = CurrencyUtils.getLocalizedCurrencySymbol(props.selectedCurrencyCode);
    const isCurrencySymbolLTR = CurrencyUtils.isCurrencySymbolLTR(props.selectedCurrencyCode);

    const currencySymbolButton = (
        <CurrencySymbolButton
            currencySymbol={currencySymbol}
            onCurrencyButtonPress={props.onCurrencyButtonPress}
        />
    );

    /**
     * Set a new amount value properly formatted
     *
     * @param {String} text - Changed text from user input
     */
    const setFormattedAmount = (text) => {
        const newAmount = MoneyRequestUtils.addLeadingZero(MoneyRequestUtils.replaceAllDigits(text, fromLocaleDigit));
        props.onChangeAmount(newAmount);
    };

    const amountTextInput = (
        <AmountTextInput
            formattedAmount={props.formattedAmount}
            onChangeAmount={setFormattedAmount}
            placeholder={props.placeholder}
            ref={props.forwardedRef}
            selection={props.selection}
            onSelectionChange={(e) => {
                props.onSelectionChange(e);
            }}
            onKeyPress={props.onKeyPress}
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

BaseTextInputWithCurrencySymbol.propTypes = textInputWithCurrencySymbolPropTypes.propTypes;
BaseTextInputWithCurrencySymbol.defaultProps = textInputWithCurrencySymbolPropTypes.defaultProps;
BaseTextInputWithCurrencySymbol.displayName = 'BaseTextInputWithCurrencySymbol';

const BaseTextInputWithCurrencySymbolWithRef = React.forwardRef((props, ref) => (
    <BaseTextInputWithCurrencySymbol
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

BaseTextInputWithCurrencySymbolWithRef.displayName = 'BaseTextInputWithCurrencySymbolWithRef';

export default BaseTextInputWithCurrencySymbolWithRef;
