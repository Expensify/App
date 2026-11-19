import PeekSurfaceContext from '@components/Navigation/PeekSurfaceContext';
import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import type {CollapseSurface} from '@components/Navigation/SearchSidebarCollapseStore';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {MENU_CLOSE_DELAY_MS} from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useContext, useEffect, useEffectEvent, useRef} from 'react';
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
    const {holdPeek, releasePeek} = useContext(PeekSurfaceContext);
    const isHoldingPeekRef = useRef(false);

    // Each menu holds the peek at most once, so a show without a matching hide cannot leave the surface held for good.
    const holdPeekWhileShown = () => {
        if (isHoldingPeekRef.current) {
            return;
        }
        isHoldingPeekRef.current = true;
        holdPeek();
    };

    // A hide without a matching show must not release a hold another menu owns.
    const releasePeekHeldByMenu = () => {
        if (!isHoldingPeekRef.current) {
            return;
        }
        isHoldingPeekRef.current = false;
        releasePeek();
    };

    // The hold has no modal hide to end it when the menu unmounts while open, for example when a pick collapses the sidebar or the user leaves Spend.
    const releasePeekOnUnmount = useEffectEvent(releasePeekHeldByMenu);
    useEffect(() => () => releasePeekOnUnmount(), []);

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
                onModalShow={holdPeekWhileShown}
                // Share keeps the menu open and closes it later by itself, so the peek is settled once the menu is gone and not when an item is picked.
                onModalHide={releasePeekHeldByMenu}
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
