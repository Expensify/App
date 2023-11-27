import React, {ForwardedRef, forwardRef, KeyboardEvent as ReactKeyboardEvent} from 'react';
import {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
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

function Checkbox(
    {
        isChecked = false,
        hasError = false,
        disabled = false,
        style,
        containerStyle,
        children = null,
        onMouseDown,
        containerSize = 20,
        containerBorderRadius = 4,
        caretSize = 14,
        onPress,
        accessibilityLabel,
    }: CheckboxProps,
    ref: ForwardedRef<View>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const handleSpaceKey = (event?: ReactKeyboardEvent) => {
        if (event?.code !== 'Space') {
            return;
        }

        onPress();
    };

    const firePressHandlerOnClick = (event?: GestureResponderEvent | KeyboardEvent) => {
        // Pressable can be triggered with Enter key and by a click. As this is a checkbox,
        // We do not want to toggle it, when Enter key is pressed.
        if (event?.type && event.type !== 'click') {
            return;
        }

        onPress();
    };

    return (
        <PressableWithFeedback
            disabled={disabled}
            onPress={firePressHandlerOnClick}
            onMouseDown={onMouseDown}
            ref={ref}
            style={[StyleUtils.getCheckboxPressableStyle(containerBorderRadius + 2), style]} // to align outline on focus, border-radius of pressable should be 2px more than Checkbox
            onKeyDown={handleSpaceKey}
            role={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
            aria-checked={isChecked}
            accessibilityLabel={accessibilityLabel}
            pressDimmingValue={1}
        >
            {children ?? (
                <View
                    style={[
                        StyleUtils.getCheckboxContainerStyle(containerSize, containerBorderRadius),
                        containerStyle,
                        isChecked && styles.checkedContainer,
                        hasError && styles.borderColorDanger,
                        disabled && styles.cursorDisabled,
                        disabled && styles.buttonOpacityDisabled,
                        isChecked && styles.borderColorFocus,
                    ]}
                >
                    {isChecked && (
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={theme.textLight}
                            height={caretSize}
                            width={caretSize}
                        />
                    )}
                </View>
            )}
        </PressableWithFeedback>
    );
}

Checkbox.displayName = 'Checkbox';

export default forwardRef(Checkbox);
