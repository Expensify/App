import React from 'react';
import _ from 'underscore';
// eslint-disable-next-line no-restricted-imports
import {TextInput} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    forwardedRef: () => {},
};

const RNTextInput = props => (
    <TextInput
        allowFontScaling={false}
        ref={(ref) => {
            if (!_.isFunction(props.forwardedRef)) {
                return;
            }
            props.forwardedRef(ref);
        }}
        // eslint-disable-next-line
        {...props}
    />
);

RNTextInput.propTypes = propTypes;
RNTextInput.defaultProps = defaultProps;
RNTextInput.displayName = 'RNTextInput';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <RNTextInput {...props} forwardedRef={ref} />
));
