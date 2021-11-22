import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';

const propTypes = {
    /** Children view component for this action item */
    children: PropTypes.node.isRequired,
};

const ReportActionItemGrouped = props => (
    <View style={[styles.chatItem]}>
        <View style={[styles.chatItemRightGrouped]}>
            {props.children}
        </View>
    </View>
);

ReportActionItemGrouped.propTypes = propTypes;
ReportActionItemGrouped.displayName = 'ReportActionItemGrouped';
export default ReportActionItemGrouped;
