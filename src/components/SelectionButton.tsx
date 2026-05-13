import type {ForwardedRef, MouseEventHandler, KeyboardEvent as ReactKeyboardEvent} from 'react';
import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Icon from './Icon';
import type {PressableRef} from './Pressable/GenericPressable/types';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type BaseSelectionButtonProps = Partial<ChildrenProps> &
    WithSentryLabel & {
        /** A function that is called when the button is pressed */
        onPress: (event?: GestureResponderEvent | KeyboardEvent) => void;

        /** Should the input be styled for errors  */
        hasError?: boolean;

        /** Should the input be disabled  */
        disabled?: boolean;

        /** Additional styles to add to the pressable wrapper */
        style?: StyleProp<ViewStyle>;

        /** Additional styles to add to the indicator container */
        containerStyle?: StyleProp<ViewStyle>;

        /** Callback that is called when mousedown is triggered. */
        onMouseDown?: MouseEventHandler;

        /** The size of the indicator container */
        containerSize?: number;

        /** Override for the border radius of the indicator container (auto-derived from role by default) */
        containerBorderRadius?: number;

        /** The size of the caret (checkmark) */
        caretSize?: number;

        /** An accessibility label */
        accessibilityLabel: string;

        /** stop propagation of the mouse down event */
        shouldStopMouseDownPropagation?: boolean;

        /** Whether the button should be selected when pressing Enter key */
        shouldSelectOnPressEnter?: boolean;

        /** Additional styles to add to the outer wrapper */
        wrapperStyle?: StyleProp<ViewStyle>;

        /** Used to locate this view in end-to-end tests. */
        testID?: string;

        /** Reference to the outer element */
        ref?: ForwardedRef<View>;

        /** Tab index */
        tabIndex?: 0 | -1;

        /** Whether the button is accessible to screen readers */
        accessible?: boolean;
    };

type CheckboxProps = BaseSelectionButtonProps & {
    /** Whether the button is in the indeterminate ("mixed") state */
    isIndeterminate?: boolean;

    /** Whether the button is checked/selected */
    isChecked?: boolean;
};

type RadioButtonProps = BaseSelectionButtonProps & {
    /** Not applicable for radio buttons */
    isIndeterminate?: never;

    /** Whether the button is checked/selected */
    isChecked: boolean;
};

type SelectionButtonProps =
    | ({
          /** Whether this renders as a checkbox (square) */
          role: typeof CONST.ROLE.CHECKBOX;
      } & CheckboxProps)
    | ({
          /** Whether this renders as a radio button (circular) */
          role: typeof CONST.ROLE.RADIO;
      } & RadioButtonProps);

/**
 * Selection button that renders as either a checkbox (square) or radio button (circular)
 * based on the role prop. Border radius is automatically derived from role.
 */
function SelectionButton({
    role,
    isChecked = false,
    isIndeterminate = false,
    hasError = false,
    disabled = false,
    style,
    containerStyle,
    children = null,
    onMouseDown,
    containerSize = 20,
    containerBorderRadius,
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
    accessible,
}: SelectionButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Minus']);

    const borderRadius = containerBorderRadius ?? (role === CONST.ROLE.RADIO ? variables.componentBorderRadiusCircle : variables.componentBorderRadiusSmall);

    const handleSpaceOrEnterKey = (event?: ReactKeyboardEvent) => {
        if (event?.code !== 'Space' && event?.code !== 'Enter') {
            return;
        }

        if (event?.code === 'Enter' && !shouldSelectOnPressEnter) {
            return;
        }

        onPress(event.nativeEvent);
    };

    const firePressHandlerOnClick = (event?: GestureResponderEvent | KeyboardEvent) => {
        if (event?.type && event.type !== 'click') {
            return;
        }

        onPress(event);
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
            style={[StyleUtils.getSelectionButtonPressableStyle(borderRadius + 2), style]}
            onKeyDown={handleSpaceOrEnterKey}
            tabIndex={tabIndex}
            role={role}
            accessibilityState={{
                checked: isIndeterminate ? 'mixed' : isChecked,
            }}
            aria-checked={isIndeterminate ? 'mixed' : isChecked}
            accessibilityLabel={accessibilityLabel}
            accessible={accessible}
            pressDimmingValue={1}
            wrapperStyle={wrapperStyle}
            sentryLabel={sentryLabel}
            shouldUseAutoHitSlop
        >
            {children ?? (
                <View
                    style={[
                        StyleUtils.getSelectionButtonContainerStyle(containerSize, borderRadius),
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
                            src={isChecked ? icons.Checkmark : icons.Minus}
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

export default SelectionButton;

export type {BaseSelectionButtonProps, CheckboxProps, RadioButtonProps, SelectionButtonProps};
