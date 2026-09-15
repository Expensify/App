import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';

/** Horizontal Expensify wordmark shown at the top of the flat navigation bar, tinted to match body text. */
function FlatNavLogo() {
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);

    return (
        <Icon
            src={icons.ExpensifyWordmark}
            fill={theme.text}
            width={variables.flatNavigationBarLogoWidth}
            height={variables.flatNavigationBarLogoHeight}
        />
    );
}

export default FlatNavLogo;
