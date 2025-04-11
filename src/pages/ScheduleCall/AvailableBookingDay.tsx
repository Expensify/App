import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import Text from '@components/Text';

type AvailableBookingDayProps = {
    /** Whether day should be disabledes */
    disabled?: boolean;

    /** Specifies direction of icon */
    selected?: boolean;

    pressed?: boolean;
    hovered?: boolean;
    children?: number;
};

function AvailableBookingDay({disabled, selected, pressed, hovered, children}: AvailableBookingDayProps) {
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

AvailableBookingDay.displayName = 'AvailableBookingDay';

export default AvailableBookingDay;
