import React from 'react';
import {
    // eslint-disable-next-line no-restricted-imports
    TextInput as RNTextInput,
} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    forwardedRef: () => {},
};

const BaseInput = props => (
    <RNTextInput
        ref={(ref) => {
            if (typeof props.forwardedRef !== 'function') {
                return;
            }
            props.forwardedRef(ref);
        }}

        // By default, align input to the left to override right alignment in RTL mode which is not yet supported in the App.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        textAlign="left"

        // eslint-disable-next-line
        {...props}
    />
);

BaseInput.propTypes = propTypes;
BaseInput.defaultProps = defaultProps;
BaseInput.displayName = 'BaseInput';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <BaseInput {...props} forwardedRef={ref} />
));
