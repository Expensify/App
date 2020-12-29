import React from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator, Text, TouchableOpacity, View,
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
    isLoading: PropTypes.bool.isRequired,

    // A function that is called when the button is clicked on
    onClick: PropTypes.func.isRequired,

    // Whether or not to show the restart sign in button
    showRestartButton: PropTypes.bool,

    /* Onyx Props */

    // The session of the logged in person
    session: PropTypes.shape({
        // Error to display when there is a session error returned
        error: PropTypes.string,
    }),
};
const defaultProps = {
    showRestartButton: true,
    session: {},
};

const SubmitButton = (props) => {
    // When there is an error in the session (a sign on error) then the button should be
    // enabled so the form can be submitted again
    const isLoading = props.isLoading && !props.session.error;
    return (
        <>
            <TouchableOpacity
                style={[styles.button, styles.buttonSuccess, styles.mb2]}
                onPress={props.onClick}
                underlayColor={themeColors.componentBG}
                disabled={isLoading}
            >
                {isLoading ? (
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
};

SubmitButton.propTypes = propTypes;
SubmitButton.defaultProps = defaultProps;
SubmitButton.displayName = 'SubmitButton';

export default withOnyx({
    session: {key: ONYXKEYS.SESSION},
})(SubmitButton);
