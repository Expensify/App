import React, {Component} from 'react';
import {ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Text from '../Text';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import Icon from '../Icon';
import CONST from '../../CONST';
import * as StyleUtils from '../../styles/StyleUtils';
import HapticFeedback from '../../libs/HapticFeedback';
import withNavigationFallback from '../withNavigationFallback';
import compose from '../../libs/compose';
import * as Expensicons from '../Icon/Expensicons';
import withNavigationFocus from '../withNavigationFocus';
import validateSubmitShortcut from './validateSubmitShortcut';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';

const propTypes = {
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

    /** Whether Button is on active screen */
    isFocused: PropTypes.bool.isRequired,

    /** Id to use for this button */
    nativeID: PropTypes.string,

    /** Accessibility label for the component */
    accessibilityLabel: PropTypes.string,

    /** A ref to forward the button */
    // eslint-disable-next-line react/forbid-prop-types
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.object})]),
};

const defaultProps = {
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
    shouldUseDefaultHover: false,
    success: false,
    danger: false,
    children: null,
    shouldRemoveRightBorderRadius: false,
    shouldRemoveLeftBorderRadius: false,
    shouldEnableHapticFeedback: false,
    nativeID: '',
    accessibilityLabel: '',
    forwardedRef: undefined,
};

class Button extends Component {
    constructor(props) {
        super(props);

        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        if (!this.props.pressOnEnter) {
            return;
        }

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;

        // Setup and attach keypress handler for pressing the button with Enter key
        this.unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            (e) => {
                if (!validateSubmitShortcut(this.props.isFocused, this.props.isDisabled, this.props.isLoading, e)) {
                    return;
                }
                this.props.onPress();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            false,
            this.props.enterKeyEventListenerPriority,
            false,
        );
    }

    componentWillUnmount() {
        // Cleanup event listeners
        if (!this.unsubscribe) {
            return;
        }
        this.unsubscribe();
    }

    renderContent() {
        if (this.props.children) {
            return this.props.children;
        }

        const textComponent = (
            <Text
                numberOfLines={1}
                selectable={false}
                style={[
                    this.props.isLoading && styles.opacity0,
                    styles.pointerEventsNone,
                    styles.buttonText,
                    this.props.small && styles.buttonSmallText,
                    this.props.medium && styles.buttonMediumText,
                    this.props.large && styles.buttonLargeText,
                    this.props.success && styles.buttonSuccessText,
                    this.props.danger && styles.buttonDangerText,
                    this.props.icon && styles.textAlignLeft,
                    ...this.props.textStyles,
                ]}
            >
                {this.props.text}
            </Text>
        );

        if (this.props.icon || this.props.shouldShowRightIcon) {
            return (
                <View style={[styles.justifyContentBetween, styles.flexRow]}>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexShrink1]}>
                        {this.props.icon && (
                            <View style={[styles.mr1, ...this.props.iconStyles]}>
                                <Icon
                                    src={this.props.icon}
                                    fill={this.props.iconFill}
                                    small={this.props.small}
                                />
                            </View>
                        )}
                        {textComponent}
                    </View>
                    {this.props.shouldShowRightIcon && (
                        <View style={[styles.justifyContentCenter, styles.ml1, ...this.props.iconRightStyles]}>
                            <Icon
                                src={this.props.iconRight}
                                fill={this.props.iconFill}
                                small={this.props.small}
                            />
                        </View>
                    )}
                </View>
            );
        }

        return textComponent;
    }

    render() {
        return (
            <PressableWithFeedback
                ref={this.props.forwardedRef}
                onPress={(e) => {
                    if (e && e.type === 'click') {
                        e.currentTarget.blur();
                    }

                    if (this.props.shouldEnableHapticFeedback) {
                        HapticFeedback.press();
                    }
                    return this.props.onPress(e);
                }}
                onLongPress={(e) => {
                    if (this.props.shouldEnableHapticFeedback) {
                        HapticFeedback.longPress();
                    }
                    this.props.onLongPress(e);
                }}
                onPressIn={this.props.onPressIn}
                onPressOut={this.props.onPressOut}
                onMouseDown={this.props.onMouseDown}
                disabled={this.props.isLoading || this.props.isDisabled}
                wrapperStyle={[
                    this.props.isDisabled ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                    styles.buttonContainer,
                    this.props.shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                    this.props.shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                    ...StyleUtils.parseStyleAsArray(this.props.style),
                ]}
                style={[
                    styles.button,
                    this.props.small ? styles.buttonSmall : undefined,
                    this.props.medium ? styles.buttonMedium : undefined,
                    this.props.large ? styles.buttonLarge : undefined,
                    this.props.success ? styles.buttonSuccess : undefined,
                    this.props.danger ? styles.buttonDanger : undefined,
                    this.props.isDisabled && (this.props.success || this.props.danger) ? styles.buttonOpacityDisabled : undefined,
                    this.props.isDisabled && !this.props.danger && !this.props.success ? styles.buttonDisabled : undefined,
                    this.props.shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                    this.props.shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                    ...this.props.innerStyles,
                ]}
                hoverStyle={[
                    this.props.shouldUseDefaultHover && !this.props.isDisabled ? styles.buttonDefaultHovered : undefined,
                    this.props.success && !this.props.isDisabled ? styles.buttonSuccessHovered : undefined,
                    this.props.danger && !this.props.isDisabled ? styles.buttonDangerHovered : undefined,
                ]}
                nativeID={this.props.nativeID}
                accessibilityLabel={this.props.accessibilityLabel}
                hoverDimmingValue={1}
            >
                {this.renderContent()}
                {this.props.isLoading && (
                    <ActivityIndicator
                        color={this.props.success || this.props.danger ? themeColors.textLight : themeColors.text}
                        style={[styles.pAbsolute, styles.l0, styles.r0]}
                    />
                )}
            </PressableWithFeedback>
        );
    }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default compose(
    withNavigationFallback,
    withNavigationFocus,
)(
    React.forwardRef((props, ref) => (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
