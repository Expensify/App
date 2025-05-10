import React, {memo} from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type ReportActionItemDateProps = {
    created: string;
};

function ReportActionItemDate({created}: ReportActionItemDateProps) {
    const {datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();

    return <Text style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(created, false, false)}</Text>;
}

ReportActionItemDate.displayName = 'ReportActionItemDate';

export default memo(ReportActionItemDate);
