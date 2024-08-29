import React, {useRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import useSingleExecution from '@hooks/useSingleExecution';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {MenuItemProps} from './MenuItem';
import MenuItem from './MenuItem';

type MenuItemLink = string | (() => Promise<string>);

type MenuItemWithLink = MenuItemProps & {
    /** The link to open when the menu item is clicked */
    link?: MenuItemLink;

    /** A unique key for the menu item */
    key?: string;
};

type MenuItemListProps = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: MenuItemWithLink[];

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution?: boolean;
};

function MenuItemList({menuItems = [], shouldUseSingleExecution = false}: MenuItemListProps) {
    const popoverAnchor = useRef<View>(null);
    const {isExecuting, singleExecution} = useSingleExecution();

    /**
     * Handle the secondary interaction for a menu item.
     *
     * @param link the menu item link or function to get the link
     * @param event the interaction event
     */
    const secondaryInteraction = (link: MenuItemLink | undefined, event: GestureResponderEvent | MouseEvent) => {
        if (typeof link === 'function') {
            link().then((url) => ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, url, popoverAnchor.current));
        } else if (link) {
            ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, link, popoverAnchor.current);
        }
    };

    return (
        <>
            {menuItems.map((menuItemProps) => (
                <MenuItem
                    key={menuItemProps.key ?? menuItemProps.title}
                    onSecondaryInteraction={menuItemProps.link !== undefined ? (e) => secondaryInteraction(menuItemProps.link, e) : undefined}
                    ref={popoverAnchor}
                    shouldBlockSelection={!!menuItemProps.link}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...menuItemProps}
                    disabled={!!menuItemProps.disabled || isExecuting}
                    onPress={shouldUseSingleExecution ? singleExecution(menuItemProps.onPress) : menuItemProps.onPress}
                />
            ))}
        </>
    );
}

MenuItemList.displayName = 'MenuItemList';

export type {MenuItemWithLink};
export default MenuItemList;
