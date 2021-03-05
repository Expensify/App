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
import {Route} from '../../../libs/Router';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    // callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // is page content being retrieved
    isLoading: PropTypes.bool,
};

const defaultProps = {
    isLoading: true,
};

const IOUParticipantsPage = props => (
    <View style={styles.settingsWrapper}>
        <Route path={ROUTES.IOU_BILL_SPLIT}>
            <Text style={[styles.buttonText]}>select multiple participants</Text>
        </Route>
        <Route path={ROUTES.IOU_REQUEST_MONEY}>
            <Text style={[styles.buttonText]}>select single participant</Text>
        </Route>
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
IOUParticipantsPage.defaultProps = defaultProps;

export default withOnyx({
    isLoading: {
        key: ONYXKEYS.IOU.IS_LOADING,
    },
})(IOUParticipantsPage);
