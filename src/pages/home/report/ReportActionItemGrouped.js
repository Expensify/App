import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import styles from '../../../styles/StyleSheet';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

const ReportActionItemGrouped = ({action}) => (
    <View style={[styles.chatItem]}>
        <View style={[styles.chatItemRightGrouped]}>
            <ReportActionItemMessage action={action} />
        </View>
    </View>
);

ReportActionItemGrouped.propTypes = propTypes;
export default ReportActionItemGrouped;
