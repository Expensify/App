import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // Should we request a single or multiple participant selection from user
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving participants)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
};

const IOUParticipantsPage = props => (
    <View style={styles.pageWrapper}>
        <Text style={[styles.buttonText]}>
            {props.hasMultipleParticipants ? 'select multiple participants' : 'select single participant'}
        </Text>
        {props.iou.loading && <ActivityIndicator color={themeColors.text} />}
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
IOUParticipantsPage.defaultProps = defaultProps;

export default withOnyx({
    appStaiouteIOU: {key: ONYXKEYS.IOU},
})(IOUParticipantsPage);
