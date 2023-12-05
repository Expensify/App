import React, {memo} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {withCurrentDate} from '@components/OnyxProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type ReportActionItemDateOnyxProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    currentDate: OnyxEntry<string>;
};

type ReportActionItemDateProps = ReportActionItemDateOnyxProps & {
    created: string;
};

function ReportActionItemDate({created, currentDate}: ReportActionItemDateProps) {
    console.log('** CURRENT DATE', currentDate);
    const {datetimeToCalendarTime} = useLocalize();

    const styles = useThemeStyles();
    return <Text style={[styles.chatItemMessageHeaderTimestamp]}>{datetimeToCalendarTime(created, false, false)}</Text>;
}

ReportActionItemDate.displayName = 'ReportActionItemDate';

export default compose(
    /** This component is hooked to the current date so that relative times can update when necessary
     * e.g. past midnight */
    // withCurrentDate(),
    withOnyx<ReportActionItemDateProps, ReportActionItemDateOnyxProps>({
        currentDate: {
            key: ONYXKEYS.CURRENT_DATE,
        },
    }),
    memo,
)(ReportActionItemDate);
