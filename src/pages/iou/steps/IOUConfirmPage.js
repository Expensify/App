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

    // is page content currently being retrieved
    isLoading: PropTypes.bool,

    // IOU amount
    iouAmount: PropTypes.number.isRequired,
};

const defaultProps = {
    isLoading: true,
};

const IOUConfirmPage = props => (
    <View style={styles.settingsWrapper}>
        <ButtonWithLoader
            style={[styles.button, styles.w100]}
            text={`Request $${props.iouAmount}`}
            isLoading={props.isLoading}
            onClick={props.onConfirm}
        />
    </View>
);

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;
IOUConfirmPage.defaultProps = defaultProps;

export default withOnyx({
    isLoading: {
        key: ONYXKEYS.IOU.IS_LOADING,
    },
})(IOUConfirmPage);
