import React from 'react';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

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
        <MenuItem
            {...props}
            ref={ref}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            // The animated highlight style is always applied (never swapped on `highlighted`) so the entry fade is never
            // detached from the node mid-animation. When `highlighted` is false the hook returns a static opacity: 1, so
            // this is inert for non-highlighted rows. See https://github.com/Expensify/App/issues/94005.
            outerWrapperStyle={[outerWrapperStyle, animatedHighlightStyle]}
        />
    );
}

export default HighlightableMenuItemWithTopDescription;
