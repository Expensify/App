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
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import validateSubmitShortcut from './validateSubmitShortcut';

type ButtonProps = {
    /** Should the press event bubble across multiple instances when Enter key triggers it. */
    allowBubble?: boolean;

    /** The text for the button label */
    text?: string;

    /** Boolean whether to display the right icon */
    shouldShowRightIcon?: boolean;

    /** The icon asset to display to the left of the text */
    icon?: React.FC<SvgProps> | null;

    /** The icon asset to display to the right of the text */
    iconRight?: React.FC<SvgProps>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Any additional styles to pass to the left icon container. */
    iconStyles?: Array<StyleProp<ViewStyle>>;

    /** Any additional styles to pass to the right icon container. */
    iconRightStyles?: Array<StyleProp<ViewStyle>>;

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
    onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;

    /** A function that is called when the button is long pressed */
    onLongPress?: (e?: GestureResponderEvent) => void;

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
    style?: ViewStyle | ViewStyle[];

    /** Additional button styles. Specific to the OpacityView of the button */
    innerStyles?: Array<StyleProp<ViewStyle>>;

    /** Additional text styles */
    textStyles?: Array<StyleProp<TextStyle>>;

    /** Whether we should use the default hover style */
    shouldUseDefaultHover?: boolean;

    /** Whether we should use the success theme color */
    success?: boolean;

    /** Whether we should use the danger theme color */
    danger?: boolean;

    /** Children to replace all inner contents of the button */
    children?: React.ReactNode;

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

    /** A ref to forward the button */
    forwardedRef?: React.ForwardedRef<View>;
};

function Button({
    allowBubble = false,
    text = '',
    shouldShowRightIcon = false,

    icon = null,
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
    children = null,

    shouldRemoveRightBorderRadius = false,
    shouldRemoveLeftBorderRadius = false,
    shouldEnableHapticFeedback = false,

    id = '',
    accessibilityLabel = '',
    forwardedRef = undefined,
}: ButtonProps) {
    const isFocused = useIsFocused();

    const keyboardShortcutCallback = useCallback(
        (event: GestureResponderEvent | KeyboardEvent) => {
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
        if (children) {
            return children;
        }

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
                    ...textStyles,
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
                            <View style={[styles.mr1, ...iconStyles]}>
                                <Icon
                                    src={icon}
                                    fill={iconFill}
                                    small={small}
                                />
                            </View>
                        )}
                        {textComponent}
                    </View>
                    {shouldShowRightIcon && (
                        <View style={[styles.justifyContentCenter, styles.ml1, ...iconRightStyles]}>
                            <Icon
                                src={iconRight}
                                fill={iconFill}
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
            ref={forwardedRef}
            onPress={(event) => {
                if (event && event.type === 'click') {
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
                ...StyleUtils.parseStyleAsArray(style),
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
                icon || shouldShowRightIcon ? styles.alignItemsStretch : undefined,
                ...innerStyles,
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
                    color={success || danger ? themeColors.textLight : themeColors.text}
                    style={[styles.pAbsolute, styles.l0, styles.r0]}
                />
            )}
        </PressableWithFeedback>
    );
}

Button.displayName = 'Button';

function ButtonWithRef(props: ButtonProps, ref: ForwardedRef<View>) {
    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    );
}

ButtonWithRef.displayName = 'ButtonWithRef';

export default withNavigationFallback(React.forwardRef(ButtonWithRef));
