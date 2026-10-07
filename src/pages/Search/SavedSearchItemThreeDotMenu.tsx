import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {MENU_CLOSE_DELAY_MS} from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';

type ThreeDotsMenuHandle = {hidePopoverMenu: () => void; isPopupMenuVisible: boolean};

type SavedSearchItemThreeDotMenuProps = {
    menuItems: PopoverMenuItem[];
    isDisabledItem: boolean;
    isCopied?: boolean;

    /** Replaces the default 28px box, for callers that size the menu to their own row */
    containerStyle?: StyleProp<ViewStyle>;

    iconWidth?: number;
    iconHeight?: number;
};

function SavedSearchItemThreeDotMenu({menuItems, isDisabledItem, isCopied, containerStyle, iconWidth, iconHeight}: SavedSearchItemThreeDotMenuProps) {
    const styles = useThemeStyles();
    const {endPeek} = useSearchSidebarCollapse();
    const threeDotsMenuRef = useRef<ThreeDotsMenuHandle | null>(null);

    const menuItemsWithPeekCleanup = useMemo(
        () =>
            menuItems.map((item) => {
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
            }),
        [endPeek, menuItems],
    );

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
        <View style={[styles.searchTypeMenuAccessoryBox, containerStyle, isDisabledItem && styles.pointerEventsNone]}>
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={menuItemsWithPeekCleanup}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                iconStyles={styles.wAuto}
                iconWidth={iconWidth}
                iconHeight={iconHeight}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_THREE_DOT_MENU}
                threeDotsMenuRef={threeDotsMenuRef}
            />
        </View>
    );
}

export default SavedSearchItemThreeDotMenu;
