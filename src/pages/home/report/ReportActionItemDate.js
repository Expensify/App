import React, {memo} from 'react';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Text from '../../../components/Text';
import {withCurrentDate} from '../../../components/OnyxProvider';

const propTypes = {
    /** UTC timestamp for when the action was created */
    created: PropTypes.string.isRequired,
    ...withLocalizePropTypes,
};

const ReportActionItemDate = props => (
    <Text style={[styles.chatItemMessageHeaderTimestamp]}>
        {props.datetimeToCalendarTime(props.created)}
    </Text>
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
