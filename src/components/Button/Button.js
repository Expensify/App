import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

const propTypes = {
    onPress: PropTypes.func,
    small: PropTypes.bool,
    success: PropTypes.bool,
    containerStyles: PropTypes.arrayOf(PropTypes.object),
    text: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
};

const defaulProps = {
    onPress: () => {},
    small: false,
    success: true,
    containerStyles: [],
    isLoading: false,
};

const Button = (props) => {
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
                <ActivityIndicator color={themeColors.textReversed} />
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
Button.propTypes = propTypes;
Button.defaultProps = defaulProps;

export default Button;
