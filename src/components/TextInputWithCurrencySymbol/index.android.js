import React, {useState, useEffect} from 'react';
import AmountTextInput from '../AmountTextInput';
import CurrencySymbolButton from '../CurrencySymbolButton';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import useLocalize from '../../hooks/useLocalize';
import * as MoneyRequestUtils from '../../libs/MoneyRequestUtils';
import * as textInputWithCurrencySymbolPropTypes from './textInputWithCurrencySymbolPropTypes';

function TextInputWithCurrencySymbol(props) {
    const {fromLocaleDigit} = useLocalize();
    const currencySymbol = CurrencyUtils.getLocalizedCurrencySymbol(props.selectedCurrencyCode);
    const isCurrencySymbolLTR = CurrencyUtils.isCurrencySymbolLTR(props.selectedCurrencyCode);

    const [skipNextSelectionChange, setSkipNextSelectionChange] = useState(false);

    useEffect(() => {
        setSkipNextSelectionChange(true);
    }, [props.formattedAmount]);

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
                if (skipNextSelectionChange) {
                    setSkipNextSelectionChange(false);
                    return;
                }
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

TextInputWithCurrencySymbol.propTypes = textInputWithCurrencySymbolPropTypes.propTypes;
TextInputWithCurrencySymbol.defaultProps = textInputWithCurrencySymbolPropTypes.defaultProps;
TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef((props, ref) => (
    <TextInputWithCurrencySymbol
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
