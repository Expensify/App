import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';

const propTypes = {
    /** Children view component for this action item */
    children: PropTypes.node.isRequired,
};

const ReportActionItemDraft = (props) => (
    <View style={[styles.chatItemDraft]}>
        <View style={styles.flex1}>{props.children}</View>
    </View>
);

ReportActionItemDraft.propTypes = propTypes;
ReportActionItemDraft.displayName = 'ReportActionItemDraft';
export default ReportActionItemDraft;
