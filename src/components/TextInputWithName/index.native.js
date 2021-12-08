import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {TextInput} from 'react-native';
import textInputWithNamepropTypes from './textInputWithNamepropTypes';

const TextInputWithName = props => (
    <TextInput
        ref={props.forwardedRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

TextInputWithName.propTypes = textInputWithNamepropTypes.propTypes;
TextInputWithName.defaultProps = textInputWithNamepropTypes.defaultProps;
TextInputWithName.displayName = 'TextInputWithName';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputWithName {...props} forwardedRef={ref} />
));
