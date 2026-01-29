import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
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

    return (
        <View
            style={[
                {
                    width: variables.iconSizeExtraLarge,
                    height: variables.iconSizeExtraLarge,
                    backgroundColor: theme.border,
                },
                styles.br2,
                styles.alignItemsCenter,
                styles.justifyContentCenter,
            ]}
        >
            <Text style={[styles.textMicro, styles.textSupporting]}>{monthAbbr}</Text>
            <Text style={[styles.textStrong, styles.fontSizeNormal, styles.textSupporting]}>{dayNumber}</Text>
        </View>
    );
}

export default DateIcon;
