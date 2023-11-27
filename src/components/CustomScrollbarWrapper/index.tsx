import React, {CSSProperties, useMemo} from 'react';
import {View} from 'react-native';
import Themes from '@styles/themes/Themes';
import useThemePreferenceWithStaticOverride from '@styles/themes/useThemePreferenceWithStaticOverride';
import CustomScrollbarWrapperProps from './CustomScrollbarWrapperProps';

function CustomScrollbarWrapper({children, theme: staticThemePreference}: CustomScrollbarWrapperProps): React.ReactElement {
    const preferredTheme = useThemePreferenceWithStaticOverride(staticThemePreference);
    const scrollbarTheme = useMemo<CSSProperties['colorScheme']>(() => Themes[preferredTheme].scrollBarTheme, [preferredTheme]);

    return <View style={{flex: 1, colorScheme: scrollbarTheme}}>{children}</View>;
}

export default CustomScrollbarWrapper;
