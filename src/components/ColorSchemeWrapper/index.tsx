import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useTheme from '@styles/theme/useTheme';

function ColorSchemeWrapper({children}: React.PropsWithChildren): React.ReactElement {
    const theme = useTheme();
    const styles = useThemeStyles();

    return <View style={[styles.flex1, styles.colorSchemeStyle(theme.colorScheme)]}>{children}</View>;
}

export default ColorSchemeWrapper;
