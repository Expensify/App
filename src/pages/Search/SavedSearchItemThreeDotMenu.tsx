import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import type {CollapseSurface} from '@components/Navigation/SearchSidebarCollapseStore';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {MENU_CLOSE_DELAY_MS} from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect, useRef} from 'react';
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
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
