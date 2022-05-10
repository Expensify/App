import React from 'react';
import PropTypes from 'prop-types';
import AmountTextInput from './AmountTextInput';
import CurrencySymbolButton from './CurrencySymbolButton';

const propTypes = {
    currencySymbol: PropTypes.string.isRequired,
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),
    formattedAmount: PropTypes.string.isRequired,
    isCurrencySymbolLTR: PropTypes.bool,
    onChangeAmount: PropTypes.func,
    onCurrencyButtonPress: PropTypes.func,
    placeholder: PropTypes.string.isRequired,
};

const defaultProps = {
    forwardedRef: undefined,
    isCurrencySymbolLTR: true,
    onChangeAmount: () => {},
    onCurrencyButtonPress: () => {},
};

function TextInputWithCurrencySymbol(props) {
    const currencySymbolButton = (
        <CurrencySymbolButton
            currencySymbol={props.currencySymbol}
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

    return props.isCurrencySymbolLTR
        ? [currencySymbolButton, amountTextInput]
        : [amountTextInput, currencySymbolButton];
}

TextInputWithCurrencySymbol.propTypes = propTypes;
TextInputWithCurrencySymbol.defaultProps = defaultProps;
TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextInputWithCurrencySymbol {...props} forwardedRef={ref} />
));
