import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ButtonWithLoader from '../../../components/ButtonWithLoader';

const propTypes = {
    // Callback to inform parent modal of success
    onConfirm: PropTypes.func.isRequired,

    // is page content currently being retrieved
    isLoading: PropTypes.bool.isRequired,

    // IOU amount
    iouAmount: PropTypes.number.isRequired,
};

const IOUConfirmPage = props => (
    <View style={styles.settingsWrapper}>
        <ButtonWithLoader
            style={[styles.button, styles.w100]}
            text={`Request $${props.iouAmount}`}
            isLoading={props.isLoading}
            onClick={() => props.onConfirm()}
        />
    </View>
);

IOUConfirmPage.displayName = 'IOUConfirmPage';
IOUConfirmPage.propTypes = propTypes;

export default IOUConfirmPage;
