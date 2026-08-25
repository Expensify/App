import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, TextStyle} from 'react-native';

import React, {memo} from 'react';

type ReportActionItemDateProps = {
    created: string;

    /** Whether the relative date should begin with a lowercase word when displayed inline. */
    isLowercase?: boolean;

    /** Additional styles to apply after the default timestamp style. */
    textStyle?: StyleProp<TextStyle>;
};

function ReportActionItemDate({created, isLowercase = false, textStyle}: ReportActionItemDateProps) {
    const {datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();

    // It is used to force re-render of component that display relative time, ensuring they update correctly when the date changes (e.g., at midnight).
    useOnyx(ONYXKEYS.CURRENT_DATE);

    return <Text style={[styles.chatItemMessageHeaderTimestamp, textStyle]}>{datetimeToCalendarTime(created, false, isLowercase)}</Text>;
}

export default memo(ReportActionItemDate);
