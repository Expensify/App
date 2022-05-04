import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Additional styles to add to checkbox button */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** A ref to forward to the Pressable */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),

    /** Children to wrap in CheckboxButton. */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    disabled: false,
    style: [],
    forwardedRef: undefined,
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