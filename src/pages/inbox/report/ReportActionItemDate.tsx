import React, {memo} from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type ReportActionItemDateProps = {
    created: string;
};

function ReportActionItemDate({created}: ReportActionItemDateProps) {
    const {datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();

    // It is used to force re-render of component that display relative time, ensuring they update correctly when the date changes (e.g., at midnight).
    useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});

    return <Text style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(created, false, false)}</Text>;
}

export default memo(ReportActionItemDate);
