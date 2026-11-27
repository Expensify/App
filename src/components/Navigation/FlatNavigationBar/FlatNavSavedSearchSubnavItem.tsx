/** A saved search of the subnav, with the three-dot menu to rename, share or delete it. */
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import type {FlatNavSavedSearchItem} from '@libs/Navigation/FlatNav/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import FlatNavSavedSearchMenu from './FlatNavSavedSearchMenu';
import FlatNavSubnavItem from './FlatNavSubnavItem';

type FlatNavSavedSearchSubnavItemProps = {
    item: FlatNavSavedSearchItem;
    isSelected: boolean;
    onPress: (item: FlatNavSavedSearchItem) => void;
};

function FlatNavSavedSearchSubnavItem({item, isSelected, onPress}: FlatNavSavedSearchSubnavItemProps) {
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
                    // The menu is drawn over the row's end, so the label scrolls clear of it.
                    endInset={variables.flatNavigationBarSubnavItemAccessoryWidth}
                />
                <FlatNavSavedSearchMenu item={item} />
            </FlatNavSubnavItem>
        </OfflineWithFeedback>
    );
}

export default FlatNavSavedSearchSubnavItem;
