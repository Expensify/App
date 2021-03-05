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

    // is page content currently being retrieved
    isLoading: PropTypes.bool,
};

const defaultProps = {
    isLoading: true,
};

const IOUAmountPage = props => (
    <View style={styles.settingsWrapper}>
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

IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default withOnyx({
    isLoading: {
        key: ONYXKEYS.IOU.IS_LOADING,
    },
})(IOUAmountPage);
