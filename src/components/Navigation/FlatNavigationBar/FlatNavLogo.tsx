import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

/** Horizontal Expensify wordmark shown at the top of the flat navigation bar, tinted to match body text. */
function FlatNavLogo() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);

    return (
        <View style={styles.flatNavigationBarLogo}>
            <Icon
                src={icons.ExpensifyWordmark}
                fill={theme.text}
                width={variables.flatNavigationBarLogoWidth}
                height={variables.flatNavigationBarLogoHeight}
            />
        </View>
    );
}

export default FlatNavLogo;
