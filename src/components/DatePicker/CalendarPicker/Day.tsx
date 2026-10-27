import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import type {ThemeColors} from '@styles/theme/types';

import React from 'react';
import {View} from 'react-native';

type DayProps = {
    disabled?: boolean;
    selected?: boolean;
    pressed?: boolean;
    hovered?: boolean;

    /** Whether the day is today */
    today?: boolean;

    /** date to show */
    children?: number;
};

/** The selected day's fill wins over today's, so picking today still shows it as selected */
function getBackgroundColor(theme: ThemeColors, selected?: boolean, today?: boolean) {
    if (selected) {
        return theme.success;
    }
    if (today) {
        return theme.buttonDefaultBG;
    }
    return theme.transparent;
}

function Day({disabled, selected, pressed, hovered, today, children}: DayProps) {
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
                {backgroundColor: getBackgroundColor(theme, selected, today)},
                !disabled && !selected ? StyleUtils.getButtonBackgroundColorStyle(getButtonState({isActive: hovered, isPressed: pressed}), true) : {},
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
