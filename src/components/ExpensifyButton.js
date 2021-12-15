import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable, ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import OpacityView from './OpacityView';
import ExpensifyText from './ExpensifyText';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import Icon from './Icon';
import CONST from '../CONST';

const propTypes = {
    /** The text for the button label */
    text: PropTypes.string,

    /** The icon asset to display to the left of the text */
    icon: PropTypes.func,

    /** Small sized button */
    small: PropTypes.bool,

    /** Large sized button */
    large: PropTypes.bool,

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

    /** Call the onPress function when Enter key is pressed */
    pressOnEnter: PropTypes.bool,

    /** Additional styles to add after local styles */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** Additional text styles */
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
};

const defaultProps = {
    text: '',
    icon: null,
    isLoading: false,
    isDisabled: false,
    small: false,
    large: false,
    onPress: () => {},
    onLongPress: () => {},
    onPressIn: () => {},
    onPressOut: () => {},
    pressOnEnter: false,
    style: [],
    textStyles: [],
    success: false,
    danger: false,
    ContentComponent: undefined,
    shouldRemoveRightBorderRadius: false,
    shouldRemoveLeftBorderRadius: false,
};

class ExpensifyButton extends Component {
    constructor(props) {
        super(props);
        this.additionalStyles = _.isArray(this.props.style) ? this.props.style : [this.props.style];

        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        if (!this.props.pressOnEnter) {
            return;
        }

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;

        // Setup and attach keypress handler for pressing the button with Enter key
        this.unsubscribe = KeyboardShortcut.subscribe(shortcutConfig.shortcutKey, () => {
            if (this.props.isDisabled || this.props.isLoading) {
                return;
            }
            this.props.onPress();
        }, shortcutConfig.descriptionKey, shortcutConfig.modifiers, true);
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

        if (this.props.isLoading) {
            return <ActivityIndicator color={themeColors.textReversed} />;
        }

        const textComponent = (
            <ExpensifyText
                selectable={false}
                style={[
                    styles.buttonText,
                    this.props.small && styles.buttonSmallText,
                    this.props.large && styles.buttonLargeText,
                    this.props.success && styles.buttonSuccessText,
                    this.props.danger && styles.buttonDangerText,
                    ...this.props.textStyles,
                ]}
            >
                {this.props.text}
            </ExpensifyText>
        );

        if (this.props.icon) {
            return (
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <View style={styles.mr1}>
                        <Icon
                            src={this.props.icon}
                            fill={themeColors.heading}
                            small={this.props.small}
                        />
                    </View>
                    {textComponent}
                </View>
            );
        }

        return textComponent;
    }

    render() {
        return (
            <Pressable
                onPress={this.props.onPress}
                onLongPress={this.props.onLongPress}
                onPressIn={this.props.onPressIn}
                onPressOut={this.props.onPressOut}
                disabled={this.props.isLoading || this.props.isDisabled}
                style={[
                    this.props.isDisabled ? styles.cursorDisabled : {},
                    ...this.additionalStyles,
                ]}
            >
                {({pressed, hovered}) => (
                    <OpacityView
                        shouldDim={pressed}
                        style={[
                            styles.button,
                            this.props.small ? styles.buttonSmall : undefined,
                            this.props.large ? styles.buttonLarge : undefined,
                            this.props.success ? styles.buttonSuccess : undefined,
                            this.props.danger ? styles.buttonDanger : undefined,
                            (this.props.isDisabled && this.props.success) ? styles.buttonSuccessDisabled : undefined,
                            (this.props.isDisabled && this.props.danger) ? styles.buttonDangerDisabled : undefined,
                            (this.props.isDisabled && !this.props.danger && !this.props.success) ? styles.buttonDisable : undefined,
                            (this.props.success && hovered) ? styles.buttonSuccessHovered : undefined,
                            (this.props.danger && hovered) ? styles.buttonDangerHovered : undefined,
                            this.props.shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                            this.props.shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                        ]}
                    >
                        {this.renderContent()}
                    </OpacityView>
                )}
            </Pressable>
        );
    }
}

ExpensifyButton.propTypes = propTypes;
ExpensifyButton.defaultProps = defaultProps;

export default ExpensifyButton;
