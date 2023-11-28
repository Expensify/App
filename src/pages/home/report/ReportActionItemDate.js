import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {withCurrentDate} from '@components/OnyxProvider';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** UTC timestamp for when the action was created */
    created: PropTypes.string.isRequired,
    ...withLocalizePropTypes,
};

function ReportActionItemDate(props) {
    const styles = useThemeStyles();
    return <Text style={[styles.chatItemMessageHeaderTimestamp]}>{props.datetimeToCalendarTime(props.created)}</Text>;
}

ReportActionItemDate.propTypes = propTypes;
ReportActionItemDate.displayName = 'ReportActionItemDate';

export default compose(
    withLocalize,

    /** This component is hooked to the current date so that relative times can update when necessary
     * e.g. past midnight */
    withCurrentDate(),
    memo,
)(ReportActionItemDate);
