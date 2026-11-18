import Icon from '@components/Icon';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';

/** The caret a heading shows on hover, hinting that pressing it opens the column menu. */
function HeadingCaret() {
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);

    return (
        <Icon
            src={icons.DownArrow}
            fill={theme.icon}
            width={variables.iconSizeExtraSmall}
            height={variables.iconSizeExtraSmall}
        />
    );
}

export default HeadingCaret;
