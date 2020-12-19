import React from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator, Text, TouchableOpacity, View
} from 'react-native';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

const propTypes = {
    // The text for the button label
    text: PropTypes.string.isRequired,

    // Indicates whether the button should be disabled and in the loading state
    isLoading: PropTypes.bool.isRequired,

    // A function that is called when the button is clicked on
    onClick: PropTypes.function.isRequired,
};

const SubmitButton = props => (
    <TouchableOpacity
        style={[styles.button, styles.buttonSuccess, styles.mb4]}
        onPress={props.onClick}
        underlayColor={themeColors.componentBG}
        disabled={props.isLoading}
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

SubmitButton.propTypes = propTypes;
SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
