import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import refPropTypes from '@components/refPropTypes';
import Text from '@components/Text';
import withNavigationFallback from '@components/withNavigationFallback';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import HapticFeedback from '@libs/HapticFeedback';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import validateSubmitShortcut from './validateSubmitShortcut';

const propTypes = {
    /** Should the press event bubble across multiple instances when Enter key triggers it. */
    allowBubble: PropTypes.bool,

    /** The text for the button label */
    text: PropTypes.string,

    /** Boolean whether to display the right icon */
    shouldShowRightIcon: PropTypes.bool,

    /** The icon asset to display to the left of the text */
    icon: PropTypes.func,

    /** The icon asset to display to the right of the text */
    iconRight: PropTypes.func,

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Any additional styles to pass to the left icon container. */
    // eslint-disable-next-line react/forbid-prop-types
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    /** Any additional styles to pass to the right icon container. */
    // eslint-disable-next-line react/forbid-prop-types
    iconRightStyles: PropTypes.arrayOf(PropTypes.object),

    /** Small sized button */
    small: PropTypes.bool,

    /** Large sized button */
    large: PropTypes.bool,

    /** medium sized button */
    medium: PropTypes.bool,

    /** Indicates whether the button should be disabled and in the loading state */
    isLoading: PropTypes.bool,

    /** Indicates whether the button should be disabled */
    isDisabled: PropTypes.bool,

    /** A function that is called when the button is clicked on */
    onPress: PropTypes.func,

    /** A function that is called when the button is long pressed */
    onLongPress: PropTypes.func,

    /** A function that is called when the button is pressed */
    onPressIn: PropTypes.func,

    /** A function that is called when the button is released */
    onPressOut: PropTypes.func,

    /** Callback that is called when mousedown is triggered. */
    onMouseDown: PropTypes.func,

    /** Call the onPress function when Enter key is pressed */
    pressOnEnter: PropTypes.bool,

    /** The priority to assign the enter key event listener. 0 is the highest priority. */
    enterKeyEventListenerPriority: PropTypes.number,

    /** Additional styles to add after local styles. Applied to Pressable portion of button */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Additional button styles. Specific to the OpacityView of button */
    // eslint-disable-next-line react/forbid-prop-types
    innerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Additional text styles */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether we should use the default hover style */
    shouldUseDefaultHover: PropTypes.bool,

    /** Whether we should use the success theme color */
    success: PropTypes.bool,

    /** Whether we should use the danger theme color */
    danger: PropTypes.bool,

    /** Children to replace all inner contents of button */
    children: PropTypes.node,

    /** Should we remove the right border radius top + bottom? */
    shouldRemoveRightBorderRadius: PropTypes.bool,

    /** Should we remove the left border radius top + bottom? */
    shouldRemoveLeftBorderRadius: PropTypes.bool,

    /** Should enable the haptic feedback? */
    shouldEnableHapticFeedback: PropTypes.bool,

    /** Id to use for this button */
    id: PropTypes.string,

    /** Accessibility label for the component */
    accessibilityLabel: PropTypes.string,

    /** A ref to forward the button */
    forwardedRef: refPropTypes,
};

const defaultProps = {
    allowBubble: false,
    text: '',
    shouldShowRightIcon: false,
    icon: null,
    iconRight: Expensicons.ArrowRight,
    iconFill: themeColors.textLight,
    iconStyles: [],
    iconRightStyles: [],
    isLoading: false,
    isDisabled: false,
    small: false,
    large: false,
    medium: false,
    onPress: () => {},
    onLongPress: () => {},
    onPressIn: () => {},
    onPressOut: () => {},
    onMouseDown: undefined,
    pressOnEnter: false,
    enterKeyEventListenerPriority: 0,
    style: [],
    innerStyles: [],
    textStyles: [],
    shouldUseDefaultHover: true,
    success: false,
    danger: false,
    children: null,
    shouldRemoveRightBorderRadius: false,
    shouldRemoveLeftBorderRadius: false,
    shouldEnableHapticFeedback: false,
    id: '',
    accessibilityLabel: '',
    forwardedRef: undefined,
};

function Button({
    allowBubble,
    text,
    shouldShowRightIcon,

    icon,
    iconRight,
    iconFill,
    iconStyles,
    iconRightStyles,

    small,
    large,
    medium,

    isLoading,
    isDisabled,

    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    onMouseDown,

    pressOnEnter,
    enterKeyEventListenerPriority,

    style,
    innerStyles,
    textStyles,

    shouldUseDefaultHover,
    success,
    danger,
    children,

    shouldRemoveRightBorderRadius,
    shouldRemoveLeftBorderRadius,
    shouldEnableHapticFeedback,

    id,
    accessibilityLabel,
    forwardedRef,
}) {
    const isFocused = useIsFocused();

    const keyboardShortcutCallback = useCallback(
        (event) => {
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
                    event.currentTarget.blur();
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

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
Button.displayName = 'Button';

const ButtonWithRef = React.forwardRef((props, ref) => (
    <Button
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

ButtonWithRef.displayName = 'ButtonWithRef';

export default withNavigationFallback(ButtonWithRef);
