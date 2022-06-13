import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import CONST from '../CONST';

const propTypes = {
    /** Whether checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** Children to wrap in AnimatedStep. */
    children: PropTypes.node,

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
};

const defaultProps = {
    hasError: false,
    disabled: false,
    style: [],
    forwardedRef: undefined,
    children: null,
};

function Checkbox(props) {
    function onKeyDown(event) {
        if (event.keyCode !== CONST.KEYCODE.SPACE) {
            return;
        }

        props.onPress();
    }

    function checkboxClicked(event) {
        // event.type will be undefined on native
        if (!event.type) {
            return props.onPress();
        }

        // if this was not triggered by click event
        // we do not want to toggle checkbox
        if (event.type !== 'click') {
            return;
        }

        props.onPress();
    }

    return (
        <Pressable
            disabled={props.disabled}
            onPress={checkboxClicked}
            ref={props.forwardedRef}
            style={props.style}
            onKeyDown={onKeyDown}
        >
            {props.children
                ? props.children
                : (
                    <View
                        style={[
                            styles.checkboxContainer,
                            props.isChecked && styles.checkedContainer,
                            props.hasError && styles.borderColorDanger,
                            props.disabled && styles.cursorDisabled,
                        ]}
                    >
                        <Icon src={Expensicons.Checkmark} fill="white" height={14} width={14} />
                    </View>
                )}
        </Pressable>
    );
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
