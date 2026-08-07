import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import Text from './Text';

type DateIconProps = {
    /** Date string (e.g. ISO format YYYY-MM-DD) */
    date: string;
};

function DateIcon({date}: DateIconProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {preferredLocale} = useLocalize();
    const parsedDate = parseISO(date);
    const monthAbbr = DateUtils.formatToShortMonth(parsedDate, preferredLocale);
    const dayNumber = format(parsedDate, 'd');
    const StyleUtils = useStyleUtils();

    return (
        <View style={[styles.br2, styles.alignItemsCenter, styles.justifyContentCenter, styles.dateIconSize, StyleUtils.getBackgroundColorStyle(theme.border)]}>
            <Text style={[styles.textMicro, styles.textSupporting]}>{monthAbbr}</Text>
            <Text style={[styles.textStrong, styles.fontSizeNormal, styles.textSupporting]}>{dayNumber}</Text>
        </View>
    );
}

export default DateIcon;
