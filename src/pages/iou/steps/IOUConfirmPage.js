import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import ButtonWithLoader from '../../../components/ButtonWithLoader';

const propTypes = {
    // Callback to inform parent modal of success
    onConfirm: PropTypes.func.isRequired,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    appIOU: PropTypes.shape({

        // Whether or not the IOU step is loading (creating the IOU Report)
        loading: PropTypes.bool,
    }),

    // IOU amount
    iouAmount: PropTypes.number.isRequired,
};

const defaultProps = {
    appIOU: {},
};

const IOUConfirmPage = props => (
    <View style={styles.settingsWrapper}>
        <ButtonWithLoader
            style={[styles.button, styles.w100]}
            text={`Request $${props.iouAmount}`}
            isLoading={props.appIOU.loading}
            onClick={props.onConfirm}
        />
    </View>
);

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default withOnyx({
    appIOU: {key: ONYXKEYS.APP.IOU},
})(IOUConfirmPage);
