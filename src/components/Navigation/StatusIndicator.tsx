/** The status dot of a navigation destination, drawn over the top right corner of an IconWithStatusIndicator. */
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type StatusIndicatorProps = {
    color: string;

    /** The dot's stroke reads as a gap cut out of what is behind the icon, so it takes that background. Defaults to the bar's. */
    borderColor?: ColorValue;

    testID?: string;
};

function StatusIndicator({color, borderColor, testID}: StatusIndicatorProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View
            testID={testID}
            style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(color), !!borderColor && StyleUtils.getBorderColorStyle(borderColor)]}
        />
    );
}

export default StatusIndicator;
