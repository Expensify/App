import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {useIsAtActiveLevel} from './SubContext';

function Separator(): React.ReactElement | null {
    const isAtActiveLevel = useIsAtActiveLevel('PopoverMenu.Separator');
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <View
            accessibilityRole="none"
            style={[styles.mv2, styles.ph5, {borderTopWidth: 1, borderTopColor: theme.border}]}
        />
    );
}

Separator.displayName = 'PopoverMenu.Separator';

export default Separator;
