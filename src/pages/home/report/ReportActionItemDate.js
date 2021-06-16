import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    /** UTC timestamp for when the action was created */
    timestamp: PropTypes.number.isRequired,
    ...withLocalizePropTypes,
};

const ReportActionItemDate = props => (
    <Text style={[styles.chatItemMessageHeaderTimestamp]}>
        {props.timestampToDateTime(props.timestamp)}
    </Text>
);

ReportActionItemDate.propTypes = propTypes;
ReportActionItemDate.displayName = 'ReportActionItemDate';

export default compose(
    withLocalize,
    withOnyx({
        currentDate: {
            key: ONYXKEYS.CURRENT_DATE,
        },
    }),
    memo,
)(ReportActionItemDate);
