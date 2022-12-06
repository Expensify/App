import React, {Component} from 'react';
import {Pressable, ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import OpacityView from './OpacityView';
import Text from './Text';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import Icon from './Icon';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';
import HapticFeedback from '../libs/HapticFeedback';
import withNavigationFallback from './withNavigationFallback';
import compose from '../libs/compose';
import * as Expensicons from './Icon/Expensicons';
import withNavigationFocus from './withNavigationFocus';

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

    /** Any additional styles to pass to the icon container. */
    // eslint-disable-next-line react/forbid-prop-types
    iconStyles: PropTypes.arrayOf(PropTypes.object),

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
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** Additional button styles. Specific to the OpacityView of button */
    // eslint-disable-next-line react/forbid-prop-types
    innerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Additional text styles */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether we should use the success theme color */
    success: PropTypes.bool,

    /** Whether we should use the danger theme color */
    danger: PropTypes.bool,

    /** Optional content component to replace all inner contents of button */
    ContentComponent: PropTypes.func,

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
};

const defaultProps = {
    text: '',
    shouldShowRightIcon: false,
    icon: null,
    iconRight: Expensicons.ArrowRight,
    iconFill: themeColors.textLight,
    iconStyles: [],
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
    success: false,
    danger: false,
    ContentComponent: undefined,
    shouldRemoveRightBorderRadius: false,
    shouldRemoveLeftBorderRadius: false,
    shouldEnableHapticFeedback: false,
    nativeID: '',
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
        this.unsubscribe = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, (e) => {
            if (!this.props.isFocused || this.props.isDisabled || this.props.isLoading || (e && e.target.nodeName === 'TEXTAREA')) {
                return;
            }
            e.preventDefault();
            this.props.onPress();
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true, false, this.props.enterKeyEventListenerPriority, false);
    }

    componentWillUnmount() {
        // Cleanup event listeners
        if (!this.unsubscribe) {
            return;
        }
        this.unsubscribe();
    }

    renderContent() {
        const ContentComponent = this.props.ContentComponent;
        if (ContentComponent) {
            return <ContentComponent />;
        }

        const textComponent = (
            <Text
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
                    ...this.props.textStyles,
                ]}
            >
                {this.props.text}
            </Text>
        );

        if (this.props.icon) {
            return (
                <View style={[styles.justifyContentBetween, styles.flexRow]}>
                    <View style={[styles.alignItemsCenter, styles.flexRow]}>
                        <View style={[
                            styles.mr1,
                            ...this.props.iconStyles,
                        ]}
                        >
                            <Icon
                                src={this.props.icon}
                                fill={this.props.iconFill}
                                small={this.props.small}
                            />
                        </View>
                        {textComponent}
                    </View>
                    {this.props.shouldShowRightIcon && (
                        <View style={styles.justifyContentCenter}>
                            <Icon
                                src={this.props.iconRight}
                                fill={this.props.iconFill}
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
            <Pressable
                onPress={(e) => {
                    if (e && e.type === 'click') {
                        e.currentTarget.blur();
                    }

                    if (this.props.shouldEnableHapticFeedback) {
                        HapticFeedback.trigger();
                    }
                    this.props.onPress(e);
                }}
                onLongPress={(e) => {
                    if (this.props.shouldEnableHapticFeedback) {
                        HapticFeedback.trigger();
                    }
                    this.props.onLongPress(e);
                }}
                onPressIn={this.props.onPressIn}
                onPressOut={this.props.onPressOut}
                onMouseDown={this.props.onMouseDown}
                disabled={this.props.isLoading || this.props.isDisabled}
                style={[
                    this.props.isDisabled ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                    ...StyleUtils.parseStyleAsArray(this.props.style),
                ]}
                nativeID={this.props.nativeID}
            >
                {({pressed, hovered}) => {
                    const activeAndHovered = !this.props.isDisabled && hovered;
                    return (
                        <OpacityView
                            shouldDim={pressed}
                            style={[
                                styles.button,
                                this.props.small ? styles.buttonSmall : undefined,
                                this.props.medium ? styles.buttonMedium : undefined,
                                this.props.large ? styles.buttonLarge : undefined,
                                this.props.success ? styles.buttonSuccess : undefined,
                                this.props.danger ? styles.buttonDanger : undefined,
                                (this.props.isDisabled && this.props.success) ? styles.buttonSuccessDisabled : undefined,
                                (this.props.isDisabled && this.props.danger) ? styles.buttonDangerDisabled : undefined,
                                (this.props.isDisabled && !this.props.danger && !this.props.success) ? styles.buttonDisable : undefined,
                                (this.props.success && activeAndHovered) ? styles.buttonSuccessHovered : undefined,
                                (this.props.danger && activeAndHovered) ? styles.buttonDangerHovered : undefined,
                                this.props.shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                                this.props.shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                                ...this.props.innerStyles,
                            ]}
                        >
                            {this.renderContent()}
                            {this.props.isLoading && (
                                <ActivityIndicator
                                    color={(this.props.success || this.props.danger) ? themeColors.textLight : themeColors.text}
                                    style={[styles.pAbsolute, styles.l0, styles.r0]}
                                />
                            )}
                        </OpacityView>
                    );
                }}
            </Pressable>
        );
    }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default compose(
    withNavigationFallback,
    withNavigationFocus,
)(Button);
