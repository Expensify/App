import React from 'react';
import {View} from 'react-native';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';

function ColorSchemeWrapper({children}: React.PropsWithChildren): React.ReactElement {
    const theme = useTheme();
    const themeStyles = useThemeStyles();

    return <View style={[themeStyles.flex1, themeStyles.colorSchemeStyle(theme.colorScheme)]}>{children}</View>;
}

export default ColorSchemeWrapper;
