import React from 'react';
import _ from 'underscore';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import * as textInputWithCurrencySymbolPropTypes from './textInputWithCurrencySymbolPropTypes';

function TextInputWithCurrencySymbol(props) {
    return (
        <BaseTextInputWithCurrencySymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, 'forwardedRef')}
            ref={props.forwardedRef}
        />
    );
}

TextInputWithCurrencySymbol.propTypes = textInputWithCurrencySymbolPropTypes.propTypes;
TextInputWithCurrencySymbol.defaultProps = textInputWithCurrencySymbolPropTypes.defaultProps;
TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

const TextInputWithCurrencySymbolWithRef = React.forwardRef((props, ref) => (
    <TextInputWithCurrencySymbol
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

TextInputWithCurrencySymbolWithRef.displayName = 'TextInputWithCurrencySymbolWithRef';

export default TextInputWithCurrencySymbolWithRef;
