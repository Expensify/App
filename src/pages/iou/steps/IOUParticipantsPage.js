import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    // callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // is this IOU request for a group bill split
    hasMultipleParticipants: PropTypes.bool.isRequired,

    // is page content being retrieved
    isLoading: PropTypes.bool.isRequired,
};

const IOUParticipantsPage = props => (
    <View style={styles.settingsWrapper}>
        <Text style={[styles.buttonText]}>
            {props.hasMultipleParticipants ? '// group' : '// single'}
        </Text>
        {props.isLoading && <ActivityIndicator color={themeColors.text} />}
        <TouchableOpacity
            style={[styles.button, styles.w100, styles.mt5]}
            onPress={props.onStepComplete}
        >
            <Text style={[styles.buttonText]}>
                Next
            </Text>
        </TouchableOpacity>
    </View>
);

IOUParticipantsPage.displayName = 'IOUParticipantsPage';
IOUParticipantsPage.propTypes = propTypes;

export default IOUParticipantsPage;
