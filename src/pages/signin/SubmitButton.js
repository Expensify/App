import React from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator, Text, TouchableOpacity, View
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import {restartSignin} from '../../libs/actions/Session';

const propTypes = {
    // The text for the button label
    text: PropTypes.string.isRequired,

    // Indicates whether the button should be disabled and in the loading state
    isLoading: PropTypes.bool,

    // A function that is called when the button is clicked on
    onClick: PropTypes.func.isRequired,

    // Whether or not to show the restart sign in button
    showRestartButton: PropTypes.bool,
};
const defaultProps = {
    showRestartButton: true,
    isLoading: false,
};

const SubmitButton = props => (
    <>
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

        {props.showRestartButton && (
        <View style={[styles.mb4]}>
            <TouchableOpacity
                style={[styles.link]}
                onPress={restartSignin}
                underlayColor={themeColors.componentBG}
            >
                <Text style={[styles.link]}>
                    Change Expensify login
                </Text>
            </TouchableOpacity>
        </View>
        )}
    </>
);

SubmitButton.propTypes = propTypes;
SubmitButton.defaultProps = defaultProps;
SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
