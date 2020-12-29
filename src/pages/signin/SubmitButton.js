import React from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator, Text, TouchableOpacity
} from 'react-native';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

const propTypes = {
    // The text for the button label
    text: PropTypes.string.isRequired,

    // Indicates whether the button should be disabled and in the loading state
    isLoading: PropTypes.bool,

    // A function that is called when the button is clicked on
    onClick: PropTypes.func.isRequired,
};
const defaultProps = {
    isLoading: false,
};

const SubmitButton = props => (
    <TouchableOpacity
        style={[styles.button, styles.buttonSuccess, styles.mb2]}
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
SubmitButton.defaultProps = defaultProps;
SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
