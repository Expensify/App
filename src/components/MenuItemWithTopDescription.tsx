import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {View} from 'react-native';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

type MenuItemWithTopDescriptionProps = MenuItemProps & {
    /** Should the menu item be highlighted? */
    highlighted?: boolean;
};

function MenuItemWithTopDescription({highlighted, outerWrapperStyle, ...props}: MenuItemWithTopDescriptionProps, ref: ForwardedRef<View>) {
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
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            outerWrapperStyle={highlighted ? highlightedOuterWrapperStyle : outerWrapperStyle}
        />
    );
}

MenuItemWithTopDescription.displayName = 'MenuItemWithTopDescription';

export default forwardRef(MenuItemWithTopDescription);
