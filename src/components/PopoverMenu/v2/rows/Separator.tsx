import React from 'react';
import {View} from 'react-native';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function Separator(): React.ReactElement | null {
    const isAtActiveLevel = useIsAtActiveLevel(Separator.displayName);
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
