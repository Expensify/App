import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/** Hairline rule separating groups of rows in the flat navigation bar. */
function FlatNavDivider() {
    const styles = useThemeStyles();

    return (
        <View style={styles.flatNavigationBarDividerContainer}>
            <View style={styles.flatNavigationBarDivider} />
        </View>
    );
}

export default FlatNavDivider;
