import React, {ForwardedRef, forwardRef} from 'react';
import {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type CheckboxProps = ChildrenProps & {
    /** Whether checkbox is checked */
    isChecked?: boolean;

    /** A function that is called when the box/label is pressed */
    onPress: () => void;

    /** Should the input be styled for errors  */
    hasError?: boolean;

    /** Should the input be disabled  */
    disabled?: boolean;

    /** Additional styles to add to checkbox button */
    style?: StyleProp<ViewStyle>;

    /** Additional styles to add to checkbox container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Callback that is called when mousedown is triggered. */
    onMouseDown?: () => void;

    /** The size of the checkbox container */
    containerSize?: number;

    /** The border radius of the checkbox container */
    containerBorderRadius?: number;

    /** The size of the caret (checkmark) */
    caretSize?: number;

    /** An accessibility label for the checkbox */
    accessibilityLabel: string;
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

function Checkbox(props: CheckboxProps, ref: ForwardedRef<View>) {
    console.log('*** I RENDER ***');
    const handleSpaceKey = (event) => {
        if (event.code !== 'Space') {
            return;
        }

        props.onPress();
    };

    const firePressHandlerOnClick = (event?: GestureResponderEvent | KeyboardEvent) => {
        // Pressable can be triggered with Enter key and by a click. As this is a checkbox,
        // We do not want to toggle it, when Enter key is pressed.
        if (event?.type !== 'click') {
            return;
        }

        props.onPress();
    };

    return (
        <PressableWithFeedback
            disabled={props.disabled}
            onPress={firePressHandlerOnClick}
            onMouseDown={props.onMouseDown}
            ref={ref}
            style={[StyleUtils.getCheckboxPressableStyle(props?.containerBorderRadius ?? 0 + 2), props?.style]} // to align outline on focus, border-radius of pressable should be 2px more than Checkbox
            onKeyDown={handleSpaceKey}
            role={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
            aria-checked={props.isChecked}
            accessibilityLabel={props.accessibilityLabel}
            pressDimmingValue={1}
        >
            {props.children ? (
                props.children
            ) : (
                <View
                    style={[
                        StyleUtils.getCheckboxContainerStyle(props?.containerSize ?? 0, props.containerBorderRadius),
                        props.containerStyle,
                        props.isChecked && styles.checkedContainer,
                        props.hasError && styles.borderColorDanger,
                        props.disabled && styles.cursorDisabled,
                        props.disabled && styles.buttonOpacityDisabled,
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

Checkbox.displayName = 'Checkbox';
export default forwardRef(Checkbox);
