import React from 'react';
import {View} from 'react-native';
import type {DayProps} from '@components/DatePicker/CalendarPicker/Day';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';

function AvailableBookingDay({disabled, selected, pressed, hovered, children}: DayProps) {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <View
            style={[
                themeStyles.calendarDayContainer,
                !disabled ? [themeStyles.buttonDefaultBG, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))] : {},
                selected ? themeStyles.buttonSuccess : {},
            ]}
        >
            <Text>{children}</Text>
        </View>
    );
}

export default AvailableBookingDay;
