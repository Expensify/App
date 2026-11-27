/** The three-dot menu of a saved search in the subnav, sliding in over the row's end while the pointer or keyboard focus is on the row. */
import EdgeFade from '@components/EdgeFade';
import {COLLAPSE_SURFACE} from '@components/Navigation/SearchSidebarCollapseStore';

import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useShareSavedSearch from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasHoverSupport} from '@libs/DeviceCapabilities';
import type {FlatNavSavedSearchItem} from '@libs/Navigation/FlatNav/types';
import {getOverflowMenu} from '@libs/SearchUIUtils';

import SavedSearchItemThreeDotMenu from '@pages/Search/SavedSearchItemThreeDotMenu';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import {useIsFlatNavSubnavRowActive} from './FlatNavSubnavItem';

// Where the menu's backdrop reaches the bar's own background, leaving the rest solid behind the icon itself.
const BACKDROP_FADE_END_OFFSET = 0.6;

type FlatNavSavedSearchMenuProps = {
    item: FlatNavSavedSearchItem;
};

/**
 * A label scrolls underneath the menu, so its backdrop fades into the bar's background rather than chopping the label mid-letter.
 * It stays mounted while hidden, so a menu it opened is not closed when the pointer moves onto that menu.
 */
function FlatNavSavedSearchMenu({item}: FlatNavSavedSearchMenuProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'Trashcan', 'LinkCopy', 'Checkmark']);
    const {showDeleteModal} = useDeleteSavedSearch();
    const {copiedID, handleShare} = useShareSavedSearch();
    const isCopied = copiedID === item.savedSearchID;

    const isRowActive = useIsFlatNavSubnavRowActive();
    // The open menu's backdrop ends the row's hover, so the icon it was opened from stays shown until the menu is gone.
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isShown = isRowActive || isMenuOpen || !hasHoverSupport();
    const progress = useSharedValue(isShown ? 1 : 0);

    useEffect(() => {
        progress.set(withTiming(isShown ? 1 : 0, {duration: CONST.FLAT_NAV_ROW_ACTION_ANIMATION.DURATION, easing: Easing.ease}));
    }, [isShown, progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: progress.get(),
        transform: [{translateX: (1 - progress.get()) * CONST.FLAT_NAV_ROW_ACTION_ANIMATION.HIDDEN_OFFSET}],
    }));

    return (
        <Animated.View
            style={[styles.flatNavigationBarSubnavItemAccessory, animatedStyle]}
            pointerEvents={isShown ? 'box-none' : 'none'}
        >
            <View
                style={[styles.pAbsolute, styles.l0, styles.r0, styles.t0, styles.b0]}
                pointerEvents="none"
            >
                <EdgeFade
                    side="right"
                    fadeEndOffset={BACKDROP_FADE_END_OFFSET}
                />
            </View>
            <SavedSearchItemThreeDotMenu
                menuItems={getOverflowMenu(icons, item.savedSearchID, translate, showDeleteModal, false, undefined, {
                    onShare: () => handleShare(item.savedSearchID, item.query),
                    isCopied,
                })}
                isDisabledItem={item.isDisabled}
                isCopied={isCopied}
                collapseSurface={COLLAPSE_SURFACE.NAVIGATION_BAR}
                iconSize={variables.iconSizeSmall}
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
            />
        </Animated.View>
    );
}

export default FlatNavSavedSearchMenu;
