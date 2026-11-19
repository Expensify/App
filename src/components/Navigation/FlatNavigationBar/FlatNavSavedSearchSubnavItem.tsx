/** A saved search of the subnav, with the three-dot menu to rename, share or delete it. */
import {COLLAPSE_SURFACE} from '@components/Navigation/SearchSidebarCollapseStore';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useShareSavedSearch from '@hooks/useShareSavedSearch';

import type {FlatNavSavedSearchItem} from '@libs/Navigation/FlatNav/types';
import {getOverflowMenu} from '@libs/SearchUIUtils';

import SavedSearchItemThreeDotMenu from '@pages/Search/SavedSearchItemThreeDotMenu';

import CONST from '@src/CONST';

import React from 'react';

import FlatNavSubnavItem from './FlatNavSubnavItem';

type FlatNavSavedSearchSubnavItemProps = {
    item: FlatNavSavedSearchItem;
    isSelected: boolean;
    onPress: (item: FlatNavSavedSearchItem) => void;
};

function FlatNavSavedSearchSubnavItem({item, isSelected, onPress}: FlatNavSavedSearchSubnavItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'Trashcan', 'LinkCopy', 'Checkmark']);
    const {showDeleteModal} = useDeleteSavedSearch();
    const {copiedID, handleShare} = useShareSavedSearch();
    const isCopied = copiedID === item.savedSearchID;

    const openSavedSearch = () => {
        // The row is disabled, but a press can still arrive from an assistive technology or a stale event.
        if (item.isDisabled) {
            return;
        }
        onPress(item);
    };

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction ?? undefined}>
            <FlatNavSubnavItem>
                <FlatNavSubnavItem.Link
                    label={item.title}
                    isSelected={isSelected}
                    isDisabled={item.isDisabled}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_MENU_ITEM}
                    onPress={openSavedSearch}
                />
                <SavedSearchItemThreeDotMenu
                    menuItems={getOverflowMenu(icons, item.savedSearchID, translate, showDeleteModal, false, undefined, {
                        onShare: () => handleShare(item.savedSearchID, item.query),
                        isCopied,
                    })}
                    isDisabledItem={item.isDisabled}
                    isCopied={isCopied}
                    collapseSurface={COLLAPSE_SURFACE.NAVIGATION_BAR}
                />
            </FlatNavSubnavItem>
        </OfflineWithFeedback>
    );
}

export default FlatNavSavedSearchSubnavItem;
