import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
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
    const theme = useTheme();
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <View
            style={[
                themeStyles.calendarDayContainer,
                // Always provide an explicit backgroundColor so Android (which
                // does not reset a property when the style changes to {})
                // correctly transitions the selection highlight on every render.
                {backgroundColor: selected ? theme.success : theme.transparent},
                !disabled && !selected ? StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed), true) : {},
            ]}
        >
            <Text
                style={[
                    disabled ? themeStyles.buttonOpacityDisabled : {},
                    // Always provide an explicit color so Android repaints text
                    // correctly when selection changes. Using {} causes Android
                    // to retain the previous white color after deselection,
                    // making the day number invisible against the background.
                    {color: selected ? theme.buttonSuccessText : theme.text},
                ]}
            >
                {children}
            </Text>
        </View>
    );
}

export default Day;
export type {DayProps};
