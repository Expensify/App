import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as StyleUtils from '../styles/StyleUtils';
import CONST from '../CONST';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

const propTypes = {
    /** Whether checkbox is checked */
    isChecked: PropTypes.bool,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** Children (icon) for Checkbox */
    children: PropTypes.node,

    /** Additional styles to add to checkbox button */
    style: stylePropTypes,

    /** Additional styles to add to checkbox container */
    containerStyle: stylePropTypes,

    /** Callback that is called when mousedown is triggered. */
    onMouseDown: PropTypes.func,

    /** The size of the checkbox container */
    containerSize: PropTypes.number,

    /** The border radius of the checkbox container */
    containerBorderRadius: PropTypes.number,

    /** The size of the caret (checkmark) */
    caretSize: PropTypes.number,

    /** A ref to forward to the Pressable */
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

    /** An accessibility label for the checkbox */
    accessibilityLabel: PropTypes.string.isRequired,
};

const defaultProps = {
    isChecked: false,
    hasError: false,
    disabled: false,
    style: [],
    containerStyle: [],
    forwardedRef: undefined,
    children: null,
    onMouseDown: undefined,
    containerSize: 20,
    containerBorderRadius: 4,
    caretSize: 14,
};

function Checkbox(props) {
    const handleSpaceKey = (event) => {
        if (event.code !== 'Space') {
            return;
        }

        props.onPress();
    };

    const firePressHandlerOnClick = (event) => {
        // Pressable can be triggered with Enter key and by a click. As this is a checkbox,
        // We do not want to toggle it, when Enter key is pressed.
        if (event.type && event.type !== 'click') {
            return;
        }

        props.onPress();
    };

    return (
        <PressableWithFeedback
            disabled={props.disabled}
            onPress={firePressHandlerOnClick}
            onMouseDown={props.onMouseDown}
            ref={props.forwardedRef}
            style={[props.style, styles.checkboxPressable]}
            onKeyDown={handleSpaceKey}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
            accessibilityState={{checked: props.isChecked}}
            accessibilityLabel={props.accessibilityLabel}
            pressDimmingValue={1}
        >
            {props.children ? (
                props.children
            ) : (
                <View
                    style={[
                        StyleUtils.getCheckboxContainerStyle(props.containerSize, props.containerBorderRadius),
                        props.containerStyle,
                        props.isChecked && styles.checkedContainer,
                        props.hasError && styles.borderColorDanger,
                        props.disabled && styles.cursorDisabled,
                        props.isChecked && styles.borderColorFocus,
                    ]}
                >
                    {props.isChecked && (
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={themeColors.textLight}
                            height={props.caretSize}
                            width={props.caretSize}
                        />
                    )}
                </View>
            )}
        </PressableWithFeedback>
    );
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
