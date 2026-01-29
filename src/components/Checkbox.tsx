import type {ForwardedRef, MouseEventHandler, KeyboardEvent as ReactKeyboardEvent} from 'react';
import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {PressableRef} from './Pressable/GenericPressable/types';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type CheckboxProps = Partial<ChildrenProps> &
    WithSentryLabel & {
        /** Whether checkbox is checked */
        isChecked?: boolean;

        /** Whether checkbox is in the indeterminate (“mixed”) state */
        isIndeterminate?: boolean;

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
        onMouseDown?: MouseEventHandler;

        /** The size of the checkbox container */
        containerSize?: number;

        /** The border radius of the checkbox container */
        containerBorderRadius?: number;

        /** The size of the caret (checkmark) */
        caretSize?: number;

        /** An accessibility label for the checkbox */
        accessibilityLabel: string;

        /** stop propagation of the mouse down event */
        shouldStopMouseDownPropagation?: boolean;

        /** Whether the checkbox should be selected when pressing Enter key */
        shouldSelectOnPressEnter?: boolean;

        /** Additional styles to add to checkbox wrapper */
        wrapperStyle?: StyleProp<ViewStyle>;

        /** Used to locate this view in end-to-end tests. */
        testID?: string;

        /** Reference to the outer element */
        ref?: ForwardedRef<View>;

        /** Tab index for the checkbox */
        tabIndex?: 0 | -1;
    };

function Checkbox({
    isChecked = false,
    isIndeterminate = false,
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
    shouldStopMouseDownPropagation,
    shouldSelectOnPressEnter,
    wrapperStyle,
    testID,
    ref,
    sentryLabel,
    tabIndex,
}: CheckboxProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const handleSpaceOrEnterKey = (event?: ReactKeyboardEvent) => {
        if (event?.code !== 'Space' && event?.code !== 'Enter') {
            return;
        }

        if (event?.code === 'Enter' && !shouldSelectOnPressEnter) {
            // If the checkbox should not be selected on Enter key press, we do not want to
            // toggle it, so we return early.
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
            testID={testID}
            disabled={disabled}
            onPress={firePressHandlerOnClick}
            onMouseDown={(e) => {
                if (shouldStopMouseDownPropagation) {
                    e.stopPropagation();
                }
                onMouseDown?.(e);
            }}
            ref={ref as PressableRef}
            style={[StyleUtils.getCheckboxPressableStyle(containerBorderRadius + 2), style]} // to align outline on focus, border-radius of pressable should be 2px more than Checkbox
            onKeyDown={handleSpaceOrEnterKey}
            tabIndex={tabIndex}
            role={CONST.ROLE.CHECKBOX}
            /*  true  → checked
                false → unchecked
                mixed → indeterminate  */
            aria-checked={isIndeterminate ? 'mixed' : isChecked}
            accessibilityLabel={accessibilityLabel}
            pressDimmingValue={1}
            wrapperStyle={wrapperStyle}
            sentryLabel={sentryLabel}
            shouldUseAutoHitSlop
        >
            {children ?? (
                <View
                    style={[
                        StyleUtils.getCheckboxContainerStyle(containerSize, containerBorderRadius),
                        containerStyle,
                        (isChecked || isIndeterminate) && styles.checkedContainer,
                        hasError && styles.borderColorDanger,
                        disabled && styles.cursorDisabled,
                        disabled && styles.buttonOpacityDisabled,
                        (isChecked || isIndeterminate) && styles.borderColorFocus,
                    ]}
                >
                    {(isChecked || isIndeterminate) && (
                        <Icon
                            src={isChecked ? Expensicons.Checkmark : Expensicons.Minus}
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

export default Checkbox;

export type {CheckboxProps};
