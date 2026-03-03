import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';

type DayProps = {
    /** Whether day is disabled */
    disabled?: boolean;

    /** Whether day is selected */
    selected?: boolean;

    /** Whether day is pressed */
    pressed?: boolean;

    /** Whether day is hovered */
    hovered?: boolean;

    /** date to show */
    children?: number;
};

function Day({disabled, selected, pressed, hovered, children}: DayProps) {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <View
            style={[
                themeStyles.calendarDayContainer,
                selected ? themeStyles.buttonSuccess : {},
                !disabled && !selected ? StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed), true) : {},
            ]}
        >
            <Text style={[disabled ? themeStyles.buttonOpacityDisabled : {}, selected ? themeStyles.buttonSuccessText : {}]}>{children}</Text>
        </View>
    );
}

export default Day;
export type {DayProps};
