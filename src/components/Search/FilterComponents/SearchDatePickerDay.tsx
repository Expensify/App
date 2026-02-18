import React from 'react';
import {View} from 'react-native';
import type {DayProps} from '@components/DatePicker/CalendarPicker/Day';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function SearchDatePickerDay({disabled, selected, children}: DayProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.calendarDayContainer, selected ? styles.buttonSuccess : {}]}>
            <Text style={[disabled ? styles.buttonOpacityDisabled : {}, selected ? styles.buttonSuccessText : {}]}>{children}</Text>
        </View>
    );
}

export default SearchDatePickerDay;
