import PeekSurfaceContext from '@components/Navigation/PeekSurfaceContext';
import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import type {CollapseSurface} from '@components/Navigation/SearchSidebarCollapseStore';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {MENU_CLOSE_DELAY_MS} from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useContext, useEffect, useRef} from 'react';
import {View} from 'react-native';

type ThreeDotsMenuHandle = {hidePopoverMenu: () => void; isPopupMenuVisible: boolean};

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
    isDisabledItem: boolean;
    isCopied?: boolean;

    /** The collapsible surface whose peek ends when an item is picked. Defaults to the Spend sidebar. */
    collapseSurface?: CollapseSurface;
};

function SavedSearchItemThreeDotMenu({menuItems, isDisabledItem, isCopied, collapseSurface}: SavedSearchItemThreeDotMenuProps) {
    const styles = useThemeStyles();
    const {endPeek} = useSearchSidebarCollapse(collapseSurface);
    const threeDotsMenuRef = useRef<ThreeDotsMenuHandle | null>(null);
    const {holdPeekUntilMenuCloses, endPeekIfPointerLeft} = useContext(PeekSurfaceContext);

    const menuItemsWithPeekCleanup = menuItems.map((item) => {
        if (item.shouldCloseModalOnSelect === false) {
            return item;
        }

        return {
            ...item,
            onSelected: () => {
                endPeek();
                item.onSelected?.();
            },
        };
    });

    useEffect(() => {
        if (!isCopied) {
            return;
        }
        const timer = setTimeout(() => {
            threeDotsMenuRef.current?.hidePopoverMenu();
        }, MENU_CLOSE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isCopied]);

    return (
        <View style={[styles.searchTypeMenuAccessoryBox, isDisabledItem && styles.pointerEventsNone]}>
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={menuItemsWithPeekCleanup}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                iconStyles={styles.wAuto}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_THREE_DOT_MENU}
                threeDotsMenuRef={threeDotsMenuRef}
                // The menu opens partly outside the sidebar. Its backdrop belongs to the sidebar's React tree, so moving the pointer past the menu's edge sends the sidebar no hover-out.
                shouldOverlay
                // The pointer leaving the window from the backdrop still sends the sidebar a hover-out, so the sidebar keeps its peek until the menu is gone.
                onIconPress={holdPeekUntilMenuCloses}
                // Share closes the menu later by itself, and Escape or a click outside close it without picking an item at all.
                // The peek is settled once the menu is gone, however it closed, because the pointer may have left the sidebar meanwhile.
                onModalHide={endPeekIfPointerLeft}
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
