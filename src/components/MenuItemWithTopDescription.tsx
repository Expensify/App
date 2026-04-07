import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import mergeRefs from '@libs/mergeRefs';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

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
    const pressableRef = useRef<View>(null);
    useEffect(() => {
        const element = pressableRef.current;
        if (props.interactive || !element || !(element instanceof HTMLElement) || typeof element.onclick === 'undefined') {
            return;
        }
        // React Native Web's Pressable always attaches an onClick handler to the DOM element.
        // TalkBack on Android web uses the presence of a click event listener to determine whether
        // an element is clickable and announces "double tap to activate" even for non-interactive elements.
        // Removing the onclick property prevents TalkBack from treating the element as clickable.
        element.onclick = null;
    }, [props.interactive]);

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={mergeRefs(ref, pressableRef)}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            outerWrapperStyle={highlighted ? highlightedOuterWrapperStyle : outerWrapperStyle}
        />
    );
}

export default MenuItemWithTopDescription;
