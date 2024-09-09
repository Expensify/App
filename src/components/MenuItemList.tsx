import React, {useRef} from 'react';
import type {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';
import useSingleExecution from '@hooks/useSingleExecution';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {MenuItemProps} from './MenuItem';
import MenuItem from './MenuItem';
import IconAsset from '@src/types/utils/IconAsset';

type MenuItemLink = string | (() => Promise<string>);

type MenuItemWithLink = MenuItemProps & {
    /** The link to open when the menu item is clicked */
    link?: MenuItemLink;
};

type MenuItemListProps = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: MenuItemWithLink[];

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution?: boolean;

    /** Any additional styles to apply for each item */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Icon to display on the left side of each item */
    icon?: IconAsset;

    /** Icon Width */
    iconWidth?: number;

    /** Icon Height */
    iconHeight?: number;

    /** Is this in the Pane */
    isPaneMenu?: boolean;
};

function MenuItemList({menuItems = [], shouldUseSingleExecution = false, wrapperStyle = {}, icon = undefined, iconWidth = undefined, iconHeight = undefined, isPaneMenu = false}: MenuItemListProps) {
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
                    key={menuItemProps.title}
                    wrapperStyle={wrapperStyle}
                    onSecondaryInteraction={menuItemProps.link !== undefined ? (e) => secondaryInteraction(menuItemProps.link, e) : undefined}
                    ref={popoverAnchor}
                    shouldBlockSelection={!!menuItemProps.link}
                    icon={icon}
                    iconWidth={iconWidth}
                    iconHeight={iconHeight}
                    isPaneMenu={isPaneMenu}
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
