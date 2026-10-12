import {useSearchQueryContext} from '@components/Search/SearchContext';

import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useShareSavedSearch from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getOverflowMenu} from '@libs/SearchUIUtils';

import SavedSearchItemThreeDotMenu from '@pages/Search/SavedSearchItemThreeDotMenu';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import FlatNavItem from './FlatNavItem';
import FlatNavSubItemList from './FlatNavSubItemList';
import useFlatNavSavedSearchItems from './useFlatNavSavedSearchItems';

type FlatNavSavedSearchesProps = {
    /** Whether the rows are showing. A collapsed bar has no room for them, so the list closes rather than unmounting. */
    isExpanded: boolean;
};

/**
 * Child rows of the flat navigation bar's "Saved" group.
 *
 * Resolving a saved search's display title needs a wide slice of Onyx, so this only mounts while the group is the
 * current one. Everything above it just needs to know whether any saved searches exist.
 */
function FlatNavSavedSearches({isExpanded}: FlatNavSavedSearchesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {currentSearchKey} = useSearchQueryContext();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil', 'Trashcan', 'LinkCopy', 'Checkmark']);
    const {showDeleteModal} = useDeleteSavedSearch();
    const {copiedID, handleShare} = useShareSavedSearch();

    const items = useFlatNavSavedSearchItems();

    return (
        <FlatNavSubItemList
            isExpanded={isExpanded}
            selectedIndex={items.findIndex((item) => currentSearchKey === item.searchKey)}
        >
            {items.map((item, index) => (
                <FlatNavItem
                    key={item.key}
                    label={item.title}
                    isSelected={currentSearchKey === item.searchKey}
                    isSubItem
                    shouldShowTooltipWhenTruncated
                    isFirstSubItem={index === 0}
                    isLastSubItem={index === items.length - 1}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_MENU_ITEM}
                    hoverActionComponent={
                        <SavedSearchItemThreeDotMenu
                            menuItems={getOverflowMenu(expensifyIcons, item.key, translate, showDeleteModal, false, undefined, {
                                onShare: () => handleShare(item.key, item.query),
                                isCopied: copiedID === item.key,
                            })}
                            isDisabledItem={item.isDisabled}
                            isCopied={copiedID === item.key}
                            containerStyle={styles.wAuto}
                            iconWidth={variables.iconSizeSmall}
                            iconHeight={variables.iconSizeSmall}
                        />
                    }
                    onPress={() => {
                        if (item.isDisabled) {
                            return;
                        }
                        setSearchContext(false);
                        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: item.query, name: item.name, searchKey: item.searchKey}));
                    }}
                />
            ))}
        </FlatNavSubItemList>
    );
}

export default FlatNavSavedSearches;
