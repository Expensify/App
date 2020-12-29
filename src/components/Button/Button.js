import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

const propTypes = {
    /**
     Callback
    */
    onPress: PropTypes.func,

    /**
     * Displays small version of the button
     */
    small: PropTypes.bool,

    /**
     * Displays the button success color
     */
    success: PropTypes.bool,

    /**
     * Additional styles for the outermost button container
     */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /**
     Text to display inside the button
    */
   text: PropTypes.string.isRequired,

    /**
     * Replaces button text with a loading spinner
     */
    isLoading: PropTypes.bool,
};

const defaultProps = {
    onPress: () => {},
    small: false,
    success: true,
    containerStyles: [],
    isLoading: false,
};

export default function Button(props) {
    const containerStyles = [styles.button];
    const textStyles = [styles.buttonText];

    if (props.small) {
        containerStyles.push(styles.buttonSmall);
        textStyles.push(styles.buttonSmallText);
    }

    if (props.success) {
        containerStyles.push(styles.buttonSuccess);
        textStyles.push(styles.buttonSuccessText);
    }

    return (
        <TouchableOpacity
            style={[
                ...containerStyles,
                ...props.containerStyles,
            ]}
            onPress={props.onPress}
            underlayColor={themeColors.componentBG}
            disabled={props.isLoading}
        >
            {props.isLoading ? (
                <ActivityIndicator color={props.success ? themeColors.textReversed : themeColors.text} />
            ) : (
                <Text
                    style={textStyles}
                >
                    {props.text}
                </Text>
            )}
        </TouchableOpacity>
    );
};

Button.displayName = 'Button';
Button.propTypes = {
    /**
     Text to display inside the button
    */
    text: PropTypes.string.isRequired,
};

Button.defaultProps = defaultProps;
