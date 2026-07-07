import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';

import React from 'react';

import type {MenuItemProps} from './MenuItem';

import MenuItem from './MenuItem';

type MenuItemWithTopDescriptionProps = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function MenuItemWithTopDescription({highlighted, outerWrapperStyle, ref, ...props}: MenuItemWithTopDescriptionProps) {
    const theme = useTheme();
    const highlightedOuterWrapperStyle = useAnimatedHighlightStyle({
        shouldHighlight: highlighted ?? false,
        highlightColor: theme.messageHighlightBG,
        itemEnterDelay: 0,
    });

    return (
        <MenuItem
            {...props}
            ref={ref}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            outerWrapperStyle={highlighted ? highlightedOuterWrapperStyle : outerWrapperStyle}
        />
    );
}

export default MenuItemWithTopDescription;
