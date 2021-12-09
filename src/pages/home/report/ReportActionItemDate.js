import React, {memo} from 'react';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import ExpensifyText from '../../../components/ExpensifyText';
import {withCurrentDate} from '../../../components/OnyxProvider';

const propTypes = {
    /** UTC timestamp for when the action was created */
    timestamp: PropTypes.number.isRequired,
    ...withLocalizePropTypes,
};

const ReportActionItemDate = props => (
    <ExpensifyText style={[styles.chatItemMessageHeaderTimestamp]}>
        {props.timestampToDateTime(props.timestamp)}
    </ExpensifyText>
);

ReportActionItemDate.propTypes = propTypes;
ReportActionItemDate.displayName = 'ReportActionItemDate';

export default compose(
    withLocalize,

    /** This component is hooked to the current date so that relative times can update when necessary
     * e.g. past midnight */
    withCurrentDate(),
    memo,
)(ReportActionItemDate);
