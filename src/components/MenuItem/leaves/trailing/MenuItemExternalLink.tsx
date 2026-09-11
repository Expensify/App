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
 * Marks the row as leaving the app for a URL: renders the "opens in a new tab" icon, and offers the
 * URL through the context menu on a long press or a right-click.
 *
 * Unlike `MenuItem.Copy` this one does claim right-click, because the URL is nowhere on the screen —
 * the menu is the only way to reach it.
 *
 * Render it inside `MenuItem.Trailing`. A row that leaves the app without a URL to offer, because it
 * builds one through an API call as it goes, wants a plain `MenuItem.NewWindowIcon` instead.
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
export type {MenuItemExternalLinkProps};
