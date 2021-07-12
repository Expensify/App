import _ from 'underscore';
import React, {Component} from 'react';
import {
    Pressable, ActivityIndicator, InteractionManager
} from 'react-native';
import {propTypes, defaultProps} from './ButtonPropTypes';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import OpacityView from '../OpacityView';
import Text from '../Text';
import KeyboardShortcut from '../../libs/KeyboardShortcut';

class Button extends Component {
    constructor(props) {
        super(props);
        this.additionalStyles = _.isArray(this.props.style) ? this.props.style : [this.props.style];

        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        if (!this.props.pressOnEnter) {
            return;
        }
        // Component is not initialized yet due to navigation transitions
        // Wait until interactions are complete before trying to attach listener
        InteractionManager.runAfterInteractions(() => {
            // Setup and attach keypress handler for pressing the button with Enter key
            this.unsubscribe = KeyboardShortcut.subscribe('Enter', () => {
                if (this.props.pressOnEnter && !this.props.isDisabled && !this.props.isLoading) {
                    this.props.onPress();
                }
            }, [], true);
        });
    }

    componentWillUnmount() {
        // Cleanup event listeners
        if (!this.unsubscribe) {
            return;
        }
        this.unsubscribe();
    }

    renderContent() {
        const {ContentComponent} = this.props;
        if (ContentComponent) {
            return <ContentComponent />;
        }

        return this.props.isLoading
            ? (
                <ActivityIndicator color={themeColors.textReversed} />
            ) : (
                <Text
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
                </Text>
            );
    }

    render() {
        return (
            <Pressable
                onPress={this.props.onPress}
                disabled={this.props.isLoading || this.props.isDisabled}
                style={[
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
                            (this.props.isDisabled && this.props.danger) ? styles.buttonDangerDisabled : undefined,
                            (this.props.isDisabled && !this.props.danger) ? styles.buttonDisable : undefined,
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

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
Button.displayName = 'Button';

export default Button;
