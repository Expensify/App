import {MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT, useMenuItemAccessibilityAnnouncement} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemSecondaryInteraction} from '@components/MenuItem/MenuItemSecondaryInteractionContext';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';

import useLocalize from '@hooks/useLocalize';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

import React from 'react';

import MenuItemNewWindowIcon from './icons/MenuItemNewWindowIcon';

type MenuItemExternalLinkProps = {
    /** URL the row leads to */
    link: string;
};

/**
 * Marks the row as leading out of the app: renders the "opens in a new tab" icon and offers the URL
 * through the context menu on a long press or a right-click, the only place the URL is reachable.
 */
function MenuItemExternalLink({link}: MenuItemExternalLinkProps) {
    const {translate} = useLocalize();

    useMenuItemSecondaryInteraction((event, anchor) =>
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.LINK,
            event,
            selection: link,
            contextMenuAnchor: anchor,
        }),
    );

    // Tell the row the menu is there, so a screen reader says how to reach the URL
    useMenuItemAccessibilityAnnouncement(MENU_ITEM_ACCESSIBILITY_ANNOUNCEMENT.CONTEXT_MENU_AVAILABLE, getContextMenuAccessibilityHint({translate}));

    return <MenuItemNewWindowIcon />;
}

export default MenuItemExternalLink;
