import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import styles from '../../../styles/styles';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Is the network currently offline or not
    isOffline: PropTypes.bool.isRequired,
};

const ReportActionItemGrouped = ({action, isOffline}) => (
    <View style={[styles.chatItem]}>
        <View style={[styles.chatItemRightGrouped]}>
            <ReportActionItemMessage action={action} isOffline={isOffline} />
        </View>
    </View>
);

ReportActionItemGrouped.propTypes = propTypes;
export default ReportActionItemGrouped;
