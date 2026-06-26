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
            // The animated highlight style is applied unconditionally (not gated on `highlighted`). Gating it on
            // `highlighted` detaches the style from the node when the flag flips to false mid-animation (which happens
            // for a newly-revealed dependent tag row), freezing the entry fade at a partial opacity. When not
            // highlighted the hook returns a resting opacity of 1 with no pulse, so an always-applied style is inert.
            outerWrapperStyle={[outerWrapperStyle, animatedHighlightStyle]}
        />
    );
}

export default HighlightableMenuItemWithTopDescription;
