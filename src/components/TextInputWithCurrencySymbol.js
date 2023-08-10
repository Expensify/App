import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import AmountTextInput from './AmountTextInput';
import CurrencySymbolButton from './CurrencySymbolButton';
import * as CurrencyUtils from '../libs/CurrencyUtils';

const propTypes = {
    /** A ref to forward to amount text input */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

    /** Formatted amount in local currency  */
    formattedAmount: PropTypes.string.isRequired,

    /** Function to call when amount in text input is changed */
    onChangeAmount: PropTypes.func,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func,

    /** Placeholder value for amount text input */
    placeholder: PropTypes.string.isRequired,

    /** Currency code of user's selected currency */
    selectedCurrencyCode: PropTypes.string.isRequired,

    /** Selection Object */
    selection: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
    }),

    /** Function to call when selection in text input is changed */
    onSelectionChange: PropTypes.func,
};

const defaultProps = {
    forwardedRef: undefined,
    onChangeAmount: () => {},
    onCurrencyButtonPress: () => {},
    selection: undefined,
    onSelectionChange: () => {},
};

function TextInputWithCurrencySymbol(props) {
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

    const amountTextInput = (
        <AmountTextInput
            formattedAmount={props.formattedAmount}
            onChangeAmount={props.onChangeAmount}
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
    <TextInputWithCurrencySymbol
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
