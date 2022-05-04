import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,
};

const defaultProps = {
    onPress: () => {},
};

const CheckboxButton = props => (
    <Pressable
        disabled={props.disabled}
        onPress={props.onPress}
        ref={props.forwardedRef}
    >
        {props.children}
    </Pressable>
);

CheckboxButton.propTypes = propTypes;
CheckboxButton.defaultProps = defaultProps;
CheckboxButton.displayName = 'CheckboxButton';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <CheckboxButton {...props} forwardedRef={ref} />
));