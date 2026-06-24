import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type DateIconProps = {
    /** Date string (e.g. ISO format YYYY-MM-DD) */
    date: string;
};

function DateIcon({date}: DateIconProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const parsedDate = parseISO(date);
    const monthAbbr = format(parsedDate, 'MMM');
    const dayNumber = format(parsedDate, 'd');
    const StyleUtils = useStyleUtils();

    const textColorStyle = StyleUtils.getColorStyle(theme.reportStatusBadge.closed.textColor);
    return (
        <View
            style={[
                styles.br2,
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                styles.dateIconSize,
                StyleUtils.getBackgroundColorStyle(theme.reportStatusBadge.closed.backgroundColor),
            ]}
        >
            <Text style={[styles.textMicro, textColorStyle]}>{monthAbbr}</Text>
            <Text style={[styles.textStrong, styles.fontSizeNormal, textColorStyle]}>{dayNumber}</Text>
        </View>
    );
}

export default DateIcon;
