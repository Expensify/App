import React from 'react';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import type {MenuItemProps} from './MenuItem';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type HighlightableMenuItemWithTopDescriptionProps = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function HighlightableMenuItemWithTopDescription({highlighted, outerWrapperStyle, ref, ...props}: HighlightableMenuItemWithTopDescriptionProps) {
    const theme = useTheme();
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: highlighted ?? false,
        highlightColor: theme.messageHighlightBG,
        itemEnterDelay: 0,
    });

    return (
        <MenuItemWithTopDescription
            {...props}
            ref={ref}
            outerWrapperStyle={[outerWrapperStyle, animatedHighlightStyle]}
        />
    );
}

export default HighlightableMenuItemWithTopDescription;
