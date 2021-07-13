import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Pressable, ActivityIndicator,
} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import OpacityView from './OpacityView';
import Text from './Text';

const propTypes = {
    /** The text for the button label */
    text: PropTypes.string,

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
    isLoading: false,
    isDisabled: false,
    small: false,
    large: false,
    onPress: () => {},
    style: [],
    textStyles: [],
    success: false,
    danger: false,
    ContentComponent: undefined,
    shouldRemoveRightBorderRadius: false,
    shouldRemoveLeftBorderRadius: false,
};

const Button = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    function renderContent() {
        const {ContentComponent} = props;
        if (ContentComponent) {
            return <ContentComponent />;
        }

        return props.isLoading
            ? (
                <ActivityIndicator color={themeColors.textReversed} />
            ) : (
                <Text
                    selectable={false}
                    style={[
                        styles.buttonText,
                        props.small && styles.buttonSmallText,
                        props.large && styles.buttonLargeText,
                        props.success && styles.buttonSuccessText,
                        props.danger && styles.buttonDangerText,
                        ...props.textStyles,
                    ]}
                >
                    {props.text}
                </Text>
            );
    }

    return (
        <Pressable
            onPress={props.onPress}
            disabled={props.isLoading || props.isDisabled}
            style={[
                ...additionalStyles,
            ]}
        >
            {({pressed, hovered}) => (
                <OpacityView
                    shouldDim={pressed}
                    style={[
                        styles.button,
                        props.small ? styles.buttonSmall : undefined,
                        props.large ? styles.buttonLarge : undefined,
                        props.success ? styles.buttonSuccess : undefined,
                        props.danger ? styles.buttonDanger : undefined,
                        (props.isDisabled && props.danger) ? styles.buttonDangerDisabled : undefined,
                        (props.isDisabled && !props.danger) ? styles.buttonDisable : undefined,
                        (props.success && hovered) ? styles.buttonSuccessHovered : undefined,
                        (props.danger && hovered) ? styles.buttonDangerHovered : undefined,
                        props.shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                        props.shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                    ]}
                >
                    {renderContent()}
                </OpacityView>
            )}
        </Pressable>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
Button.displayName = 'Button';

export default Button;
