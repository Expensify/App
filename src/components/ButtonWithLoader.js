import React from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator, Text, TouchableOpacity,
} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const propTypes = {
    // The text for the button label
    text: PropTypes.string.isRequired,

    // Indicates whether the button should be disabled and in the loading state
    isLoading: PropTypes.bool,

    // Indicates whether the button should be disabled
    isDisabled: PropTypes.bool,

    // A function that is called when the button is clicked on
    onClick: PropTypes.func.isRequired,
};
const defaultProps = {
    isLoading: false,
    isDisabled: false,
};

const ButtonWithLoader = props => (
    <TouchableOpacity
        style={[styles.button, styles.buttonSuccess, styles.mb2, props.isDisabled && styles.buttonDisable]}
        onPress={props.onClick}
        underlayColor={themeColors.componentBG}
        disabled={props.isLoading || props.isDisabled}
    >
        {props.isLoading ? (
            <ActivityIndicator color={themeColors.textReversed} />
        ) : (
            <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                {props.text}
            </Text>
        )}
    </TouchableOpacity>
);

ButtonWithLoader.propTypes = propTypes;
ButtonWithLoader.defaultProps = defaultProps;
ButtonWithLoader.displayName = 'SubmitButton';

export default ButtonWithLoader;
