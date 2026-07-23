import React from 'react';

import type {MenuItemFormMessageProps} from './MenuItemFormMessage';

import MenuItemFormMessage from './MenuItemFormMessage';

type MenuItemErrorProps = Omit<MenuItemFormMessageProps, 'isError'>;

/**
 * An error message block. Place it inside the Root, after `MenuItem.Row`, to render it under the main line.
 */
function MenuItemError({children, shouldShowRedDotIndicator = false, shouldRenderAsHTML, style}: MenuItemErrorProps) {
    return (
        <MenuItemFormMessage
            isError
            shouldShowRedDotIndicator={shouldShowRedDotIndicator}
            shouldRenderAsHTML={shouldRenderAsHTML}
            style={style}
        >
            {children}
        </MenuItemFormMessage>
    );
}

MenuItemError.displayName = 'MenuItemError';

export type {MenuItemErrorProps};
export default MenuItemError;
