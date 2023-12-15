import React, {memo} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {HeaderGapProps, HeaderGapReturnType} from './types';

function HeaderGap({styles}: HeaderGapProps): HeaderGapReturnType {
    const themeStyles = useThemeStyles();
    return <View style={[themeStyles.headerGap, styles]} />;
}

HeaderGap.displayName = 'HeaderGap';

export default memo(HeaderGap);
