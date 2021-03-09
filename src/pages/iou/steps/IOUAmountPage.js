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

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving users preferred currency)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
};

const IOUAmountPage = props => (
    <View style={styles.pageWrapper}>
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

IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(IOUAmountPage);
