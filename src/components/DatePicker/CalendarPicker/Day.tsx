import React from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import Text from '@components/Text';

type DayProps = {
    /** Specifies if the arrow icon should be disabled or not. */
    disabled?: boolean;

    /** Specifies direction of icon */
    selected?: boolean;

    pressed?: boolean;
    hovered?: boolean;
    children?: number;
};

function Day({disabled, selected, pressed, hovered, children}: DayProps) {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <View
            style={[
                themeStyles.calendarDayContainer,
                selected ? themeStyles.buttonDefaultBG : {},
                !disabled ? StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)) : {},
            ]}
        >
            <Text style={disabled ? themeStyles.buttonOpacityDisabled : {}}>{children}</Text>
        </View>
    );
}

Day.displayName = 'Day';

export default Day;
