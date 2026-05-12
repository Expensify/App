import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Badge from './Badge';

type StatusBadgeProps = {
    /** Status text to display */
    text: string;

    /** Background color for the status badge */
    backgroundColor?: ColorValue;

    /** Text color for the status badge */
    textColor?: ColorValue;

    /** Additional badge styles */
    badgeStyles?: StyleProp<ViewStyle>;
};

function StatusBadge({text, backgroundColor, textColor, badgeStyles}: StatusBadgeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const bgColor = (backgroundColor ?? theme.transparent) as string;
    const txtColor = (textColor ?? theme.text) as string;

    return (
        <Badge
            text={text}
            isCondensed
            badgeStyles={[styles.ml0, styles.borderNone, StyleUtils.getBackgroundColorStyle(bgColor), badgeStyles]}
            textStyles={StyleUtils.getColorStyle(txtColor)}
        />
    );
}

export default StatusBadge;
