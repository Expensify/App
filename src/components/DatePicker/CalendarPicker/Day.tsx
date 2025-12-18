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

    /** Whether day is the current date (today or initial date) */
    isCurrent?: boolean;

    /** Whether currentDate was provided - changes styling behavior */
    hasCurrentDate?: boolean;

    /** Whether day is pressed */
    pressed?: boolean;

    /** Whether day is hovered */
    hovered?: boolean;

    /** date to show */
    children?: number;
};

function Day({disabled, selected, isCurrent, hasCurrentDate, pressed, hovered, children}: DayProps) {
    const theme = useTheme();
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const getSelectedStyle = () => {
        if (!selected) {
            return {};
        }
        // If currentDate is provided, selected date gets green circle
        if (hasCurrentDate) {
            return {backgroundColor: theme.success};
        }
        // Default behavior (no currentDate) - selected date gets gray background
        return themeStyles.buttonDefaultBG;
    };

    const getCurrentStyle = () => {
        // Current date gets gray background (only if not selected)
        if (isCurrent && !selected) {
            return themeStyles.highlightBG;
        }
        return {};
    };

    // Show white text on green background (selected with currentDate)
    const shouldShowWhiteText = selected && hasCurrentDate;

    return (
        <View
            style={[
                themeStyles.calendarDayContainer,
                getSelectedStyle(),
                getCurrentStyle(),
                !disabled && !selected && !isCurrent ? StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)) : {},
            ]}
        >
            <Text style={[disabled ? themeStyles.buttonOpacityDisabled : {}, shouldShowWhiteText ? {color: theme.textReversed} : {}]}>{children}</Text>
        </View>
    );
}

export default Day;
export type {DayProps};
