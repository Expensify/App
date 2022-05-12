import React from 'react';
import PropTypes from 'prop-types';
import AmountTextInput from './AmountTextInput';
import CurrencySymbolButton from './CurrencySymbolButton';
import * as CurrencySymbolUtils from '../libs/CurrencySymbolUtils';

const propTypes = {
    /** A ref to forward to amount text input */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),

    /** Formatted amount in local currency  */
    formattedAmount: PropTypes.string.isRequired,

    /** Function to call when amount in text input is changed */
    onChangeAmount: PropTypes.func,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func,

    /** Placeholder value for amount text input */
    placeholder: PropTypes.string.isRequired,

    /** Preferred locale of the user */
    preferredLocale: PropTypes.string.isRequired,

    /** Currency code of user's selected currency */
    selectedCurrencyCode: PropTypes.string.isRequired,
};

const defaultProps = {
    forwardedRef: undefined,
    onChangeAmount: () => {},
    onCurrencyButtonPress: () => {},
};

function TextInputWithCurrencySymbol(props) {
    const currencySymbol = CurrencySymbolUtils.getLocalizedCurrencySymbol(props.preferredLocale, props.selectedCurrencyCode);
    const isCurrencySymbolLTR = CurrencySymbolUtils.isCurrencySymbolLTR(props.preferredLocale, props.selectedCurrencyCode);

    const currencySymbolButton = (
        <CurrencySymbolButton
            currencySymbol={currencySymbol}
            onCurrencyButtonPress={props.onCurrencyButtonPress}
        />
    );

    const amountTextInput = (
        <AmountTextInput
            formattedAmount={props.formattedAmount}
            onChangeAmount={props.onChangeAmount}
            placeholder={props.placeholder}
            ref={props.forwardedRef}
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

TextInputWithCurrencySymbol.propTypes = propTypes;
TextInputWithCurrencySymbol.defaultProps = defaultProps;
TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextInputWithCurrencySymbol {...props} forwardedRef={ref} />
));
