import React, {useMemo} from 'react';
import {View} from 'react-native';
import Themes from '@styles/themes/Themes';
import useThemePreferenceWithStaticOverride from '@styles/themes/useThemePreferenceWithStaticOverride';
import useThemeStyles from '@styles/useThemeStyles';
import CustomScrollbarWrapperProps from './CustomScrollbarWrapperProps';

function CustomScrollbarWrapper({children, theme: staticThemePreference}: CustomScrollbarWrapperProps): React.ReactElement {
    const themeStyles = useThemeStyles();

    const preferredTheme = useThemePreferenceWithStaticOverride(staticThemePreference);
    const scrollbarTheme = useMemo(() => Themes[preferredTheme].scrollBarTheme, [preferredTheme]);

    return <View style={[themeStyles.flex1, themeStyles.colorSchemeStyle(scrollbarTheme)]}>{children}</View>;
}

export default CustomScrollbarWrapper;
