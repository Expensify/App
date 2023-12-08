import React, {memo} from 'react';
import {OnyxEntry} from 'react-native-onyx';
import {withCurrentDate} from '@components/OnyxProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';

type ReportActionItemDateOnyxProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    currentDate: OnyxEntry<string>;
};

type ReportActionItemDateProps = ReportActionItemDateOnyxProps & {
    created: string;
};

function ReportActionItemDate({created}: ReportActionItemDateProps) {
    const {datetimeToCalendarTime} = useLocalize();

    const styles = useThemeStyles();
    return <Text style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(created, false, false)}</Text>;
}

ReportActionItemDate.displayName = 'ReportActionItemDate';

export default memo(withCurrentDate()(ReportActionItemDate));
