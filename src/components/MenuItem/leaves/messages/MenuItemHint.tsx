import React from 'react';

import type {MenuItemFormMessageProps} from './MenuItemFormMessage';

import MenuItemFormMessage from './MenuItemFormMessage';

type MenuItemHintProps = Omit<MenuItemFormMessageProps, 'isError' | 'shouldShowRedDotIndicator'>;

/**
 * A non-error hint message block. Place it inside the Root, after `MenuItem.Row`, to render it under the main line.
 */
function MenuItemHint({children, shouldRenderAsHTML, style}: MenuItemHintProps) {
    return (
        <MenuItemFormMessage
            isError={false}
            shouldShowRedDotIndicator={false}
            shouldRenderAsHTML={shouldRenderAsHTML}
            style={style}
        >
            {children}
        </MenuItemFormMessage>
    );
}

MenuItemHint.displayName = 'MenuItemHint';

export type {MenuItemHintProps};
export default MenuItemHint;
