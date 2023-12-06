import React, {memo} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import HeaderGapProps from './types';

function HeaderGap({styles}: HeaderGapProps) {
    const themeStyles = useThemeStyles();
    return <View style={[themeStyles.headerGap, styles]} />;
}

HeaderGap.displayName = 'HeaderGap';

export default memo(HeaderGap);
