import React from 'react';
import {View} from 'react-native';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Badge from './Badge';
import Tooltip from './Tooltip';

type StatusBadgeProps = {
    /** Status text to display */
    text: string;

    /** Background color for the status badge */
    backgroundColor?: ColorValue;

    /** Text color for the status badge */
    textColor?: ColorValue;

    /** Additional badge styles */
    badgeStyles?: StyleProp<ViewStyle>;

    /** Text to display in a tooltip shown on hover of the badge. The tooltip is omitted when empty. */
    tooltipText?: string;
};

function StatusBadge({text, backgroundColor, textColor, badgeStyles, tooltipText}: StatusBadgeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const bgColor = (backgroundColor ?? theme.transparent) as string;
    const txtColor = (textColor ?? theme.text) as string;

    const badge = (
        <Badge
            text={text}
            isCondensed
            badgeStyles={[styles.ml0, styles.borderNone, StyleUtils.getBackgroundColorStyle(bgColor), badgeStyles]}
            textStyles={StyleUtils.getColorStyle(txtColor)}
        />
    );

    if (!tooltipText) {
        return badge;
    }

    // Badge does not forward a ref, so it is wrapped in a View for the tooltip's BoundsObserver to anchor to.
    return (
        <Tooltip
            text={tooltipText}
            shiftVertical={-4}
        >
            <View>{badge}</View>
        </Tooltip>
    );
}

export default StatusBadge;
