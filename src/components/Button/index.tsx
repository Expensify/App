import {useIsFocused} from '@react-navigation/native';
import React, {ForwardedRef, useCallback} from 'react';
import {ActivityIndicator, GestureResponderEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import withNavigationFallback from '@components/withNavigationFallback';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import HapticFeedback from '@libs/HapticFeedback';
import themeColors from '@styles/themes/default';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import validateSubmitShortcut from './validateSubmitShortcut';

type ButtonWithText = {
    /** The text for the button label */
    text: string;

    /** Boolean whether to display the right icon */
    shouldShowRightIcon?: boolean;

    /** The icon asset to display to the left of the text */
    icon?: React.FC<SvgProps> | null;
};

type ButtonProps = (ButtonWithText | ChildrenProps) & {
    /** Should the press event bubble across multiple instances when Enter key triggers it. */
    allowBubble?: boolean;

    /** The icon asset to display to the right of the text */
    iconRight?: React.FC<SvgProps>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Any additional styles to pass to the left icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** Any additional styles to pass to the right icon container. */
    iconRightStyles?: StyleProp<ViewStyle>;

    /** Small sized button */
    small?: boolean;

    /** Large sized button */
    large?: boolean;

    /** Medium sized button */
    medium?: boolean;

    /** Indicates whether the button should be disabled and in the loading state */
    isLoading?: boolean;

    /** Indicates whether the button should be disabled */
    isDisabled?: boolean;

    /** A function that is called when the button is clicked on */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** A function that is called when the button is long pressed */
    onLongPress?: (event?: GestureResponderEvent) => void;

    /** A function that is called when the button is pressed */
    onPressIn?: () => void;

    /** A function that is called when the button is released */
    onPressOut?: () => void;

    /** Callback that is called when mousedown is triggered. */
    onMouseDown?: () => void;

    /** Call the onPress function when Enter key is pressed */
    pressOnEnter?: boolean;

    /** The priority to assign the enter key event listener. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Additional styles to add after local styles. Applied to Pressable portion of button */
    style?: StyleProp<ViewStyle>;

    /** Additional button styles. Specific to the OpacityView of the button */
    innerStyles?: StyleProp<ViewStyle>;

    /** Additional text styles */
    textStyles?: StyleProp<TextStyle>;

    /** Whether we should use the default hover style */
    shouldUseDefaultHover?: boolean;

    /** Whether we should use the success theme color */
    success?: boolean;

    /** Whether we should use the danger theme color */
    danger?: boolean;

    /** Should we remove the right border radius top + bottom? */
    shouldRemoveRightBorderRadius?: boolean;

    /** Should we remove the left border radius top + bottom? */
    shouldRemoveLeftBorderRadius?: boolean;

    /** Should enable the haptic feedback? */
    shouldEnableHapticFeedback?: boolean;

    /** Id to use for this button */
    id?: string;

    /** Accessibility label for the component */
    accessibilityLabel?: string;
};

function Button(
    {
        allowBubble = false,

        iconRight = Expensicons.ArrowRight,
        iconFill = themeColors.textLight,
        iconStyles = [],
        iconRightStyles = [],

        small = false,
        large = false,
        medium = false,

        isLoading = false,
        isDisabled = false,

        onPress = () => {},
        onLongPress = () => {},
        onPressIn = () => {},
        onPressOut = () => {},
        onMouseDown = undefined,

        pressOnEnter = false,
        enterKeyEventListenerPriority = 0,

        style = [],
        innerStyles = [],
        textStyles = [],

        shouldUseDefaultHover = true,
        success = false,
        danger = false,

        shouldRemoveRightBorderRadius = false,
        shouldRemoveLeftBorderRadius = false,
        shouldEnableHapticFeedback = false,

        id = '',
        accessibilityLabel = '',
        ...rest
    }: ButtonProps,
    ref: ForwardedRef<View>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();

    const keyboardShortcutCallback = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (!validateSubmitShortcut(isFocused, isDisabled, isLoading, event)) {
                return;
            }
            onPress();
        },
        [isDisabled, isFocused, isLoading, onPress],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, keyboardShortcutCallback, {
        isActive: pressOnEnter,
        shouldBubble: allowBubble,
        priority: enterKeyEventListenerPriority,
        shouldPreventDefault: false,
    });

    const renderContent = () => {
        if ('children' in rest) {
            return rest.children;
        }

        const {text = '', icon = null, shouldShowRightIcon = false} = rest;

        const textComponent = (
            <Text
                numberOfLines={1}
                style={[
                    isLoading && styles.opacity0,
                    styles.pointerEventsNone,
                    styles.buttonText,
                    small && styles.buttonSmallText,
                    medium && styles.buttonMediumText,
                    large && styles.buttonLargeText,
                    success && styles.buttonSuccessText,
                    danger && styles.buttonDangerText,
                    icon && styles.textAlignLeft,
                    textStyles,
                ]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                {text}
            </Text>
        );

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (icon || shouldShowRightIcon) {
            return (
                <View style={[styles.justifyContentBetween, styles.flexRow]}>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexShrink1]}>
                        {icon && (
                            <View style={[styles.mr1, iconStyles]}>
                                <Icon
                                    src={icon}
                                    fill={iconFill || theme.textLight}
                                    small={small}
                                />
                            </View>
                        )}
                        {textComponent}
                    </View>
                    {shouldShowRightIcon && (
                        <View style={[styles.justifyContentCenter, styles.ml1, iconRightStyles]}>
                            <Icon
                                src={iconRight}
                                fill={iconFill || theme.textLight}
                                small={small}
                            />
                        </View>
                    )}
                </View>
            );
        }

        return textComponent;
    };

    return (
        <PressableWithFeedback
            ref={ref}
            onPress={(event) => {
                if (event?.type === 'click') {
                    const currentTarget = event?.currentTarget as HTMLElement;
                    currentTarget?.blur();
                }

                if (shouldEnableHapticFeedback) {
                    HapticFeedback.press();
                }
                return onPress(event);
            }}
            onLongPress={(event) => {
                if (shouldEnableHapticFeedback) {
                    HapticFeedback.longPress();
                }
                onLongPress(event);
            }}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onMouseDown={onMouseDown}
            disabled={isLoading || isDisabled}
            wrapperStyle={[
                isDisabled ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                styles.buttonContainer,
                shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                style,
            ]}
            style={[
                styles.button,
                small ? styles.buttonSmall : undefined,
                medium ? styles.buttonMedium : undefined,
                large ? styles.buttonLarge : undefined,
                success ? styles.buttonSuccess : undefined,
                danger ? styles.buttonDanger : undefined,
                isDisabled && (success || danger) ? styles.buttonOpacityDisabled : undefined,
                isDisabled && !danger && !success ? styles.buttonDisabled : undefined,
                shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                'text' in rest && (rest?.icon || rest?.shouldShowRightIcon) ? styles.alignItemsStretch : undefined,
                innerStyles,
            ]}
            hoverStyle={[
                shouldUseDefaultHover && !isDisabled ? styles.buttonDefaultHovered : undefined,
                success && !isDisabled ? styles.buttonSuccessHovered : undefined,
                danger && !isDisabled ? styles.buttonDangerHovered : undefined,
            ]}
            id={id}
            accessibilityLabel={accessibilityLabel}
            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            hoverDimmingValue={1}
        >
            {renderContent()}
            {isLoading && (
                <ActivityIndicator
                    color={success || danger ? theme.textLight : theme.text}
                    style={[styles.pAbsolute, styles.l0, styles.r0]}
                />
            )}
        </PressableWithFeedback>
    );
}

Button.displayName = 'Button';

export default withNavigationFallback(React.forwardRef(Button));
