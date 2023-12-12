import React from 'react';
import {View} from 'react-native';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';

function ColorSchemeWrapper({children}: React.PropsWithChildren): React.ReactElement {
    const theme = useTheme();
    const styles = useThemeStyles();

    return <View style={[styles.flex1, styles.colorSchemeStyle(theme.colorScheme)]}>{children}</View>;
}

export default ColorSchemeWrapper;
