import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import DateUtils from '../../../lib/DateUtils';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // UTC timestamp for when the action was created
    timestamp: PropTypes.number.isRequired,
};

const ReportHistoryItemDate = props => (
    <Text style={[styles.chatItemMessageHeaderTimestamp]}>
        {DateUtils.timestampToRelative(props.timestamp)}
    </Text>
);

ReportHistoryItemDate.propTypes = propTypes;
ReportHistoryItemDate.displayName = 'ReportHistoryItemDate';

export default ReportHistoryItemDate;
