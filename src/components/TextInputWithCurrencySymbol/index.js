import React from 'react';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import * as textInputWithCurrencySymbolPropTypes from './textInputWithCurrencySymbolPropTypes';

function TextInputWithCurrencySymbol(props) {
    return (
        <BaseTextInputWithCurrencySymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
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
