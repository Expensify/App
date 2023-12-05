import React, {memo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';

type HeaderGapProps = {
    style: StyleProp<ViewStyle>;
};

function HeaderGap({style}: HeaderGapProps) {
    const themeStyles = useThemeStyles();
    return <View style={[themeStyles.headerGap, style]} />;
}

HeaderGap.displayName = 'HeaderGap';
export default memo(HeaderGap);
