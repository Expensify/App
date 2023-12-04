import React, {memo} from 'react';
import {OnyxEntry} from 'react-native-onyx';
import {withCurrentDate} from '@components/OnyxProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';

type ReportActionItemDateOnyxProps = {
    created: OnyxEntry<string>;
};

function ReportActionItemDate({created}: ReportActionItemDateOnyxProps) {
    const {datetimeToCalendarTime} = useLocalize();

    const styles = useThemeStyles();
    return <Text style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(created, false, false)}</Text>;
}

ReportActionItemDate.displayName = 'ReportActionItemDate';

export default compose(
    /** This component is hooked to the current date so that relative times can update when necessary
     * e.g. past midnight */
    withCurrentDate(),
    memo,
)(ReportActionItemDate);
