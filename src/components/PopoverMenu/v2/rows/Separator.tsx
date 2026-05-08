import React from 'react';
import {View} from 'react-native';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import useThemeStyles from '@hooks/useThemeStyles';

/** Horizontal divider; auto-hides outside the active sub-level. */
function Separator(): React.ReactElement | null {
    const isAtActiveLevel = useIsAtActiveLevel(Separator.displayName);
    const styles = useThemeStyles();

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <View
            accessibilityRole="none"
            style={[styles.mv2, styles.ph5, styles.borderTop]}
        />
    );
}

Separator.displayName = 'PopoverMenu.Separator';

export default Separator;
