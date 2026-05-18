import React from 'react';
import {View} from 'react-native';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

function ComposerImportedState() {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    if (isSmallScreenWidth) {
        return null;
    }

    return (
        <View style={[styles.mln5, styles.mrn5]}>
            <ImportedStateIndicator />
        </View>
    );
}

export default ComposerImportedState;
