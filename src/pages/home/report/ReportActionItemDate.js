import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import DateUtils from '../../../libs/DateUtils';
import styles from '../../../styles/styles';

const propTypes = {
    // UTC timestamp for when the action was created
    timestamp: PropTypes.number.isRequired,
};

const ReportActionItemDate = props => (
    <Text style={[styles.chatItemMessageHeaderTimestamp]}>
        {DateUtils.timestampToDateTime('en', props.timestamp)}
    </Text>
);

ReportActionItemDate.propTypes = propTypes;
ReportActionItemDate.displayName = 'ReportActionItemDate';

export default memo(ReportActionItemDate);
