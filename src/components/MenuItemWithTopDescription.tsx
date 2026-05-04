import React from 'react';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import variables from '@styles/variables';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

type MenuItemWithTopDescriptionProps = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function MenuItemWithTopDescription({highlighted, outerWrapperStyle, ref, style, ...props}: MenuItemWithTopDescriptionProps) {
    const theme = useTheme();
    const highlightedOuterWrapperStyle = useAnimatedHighlightStyle({
        shouldHighlight: highlighted ?? false,
        highlightColor: theme.messageHighlightBG,
        itemEnterDelay: 0,
    });

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            style={[{paddingVertical: 8, minHeight: variables.menuItemWithTopDescriptionMinHeight}, style]}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            outerWrapperStyle={highlighted ? highlightedOuterWrapperStyle : outerWrapperStyle}
        />
    );
}

export default MenuItemWithTopDescription;
