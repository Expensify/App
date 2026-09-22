import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useShareSavedSearch from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import {getLastSearchQuery, getOverflowMenu} from '@libs/SearchUIUtils';

import useSavedSearchTitles from '@pages/Search/hooks/useSavedSearchTitles';
import SavedSearchItemThreeDotMenu from '@pages/Search/SavedSearchItemThreeDotMenu';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {accountIDSelector} from '@selectors/Session';
import React from 'react';

import FlatNavItem from './FlatNavItem';

/**
 * Child rows of the flat navigation bar's "Saved" group.
 *
 * Resolving a saved search's display title needs a wide slice of Onyx, so this only mounts while the group is
 * expanded. Everything above it just needs to know whether any saved searches exist.
 */
function FlatNavSavedSearches() {
    const styles = useThemeStyles();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const reportAttributes = useReportAttributes();

    const {currentSearchKey} = useSearchQueryContext();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil', 'Trashcan', 'LinkCopy', 'Checkmark']);
    const {showDeleteModal} = useDeleteSavedSearch();
    const {copiedID, handleShare} = useShareSavedSearch();

    const savedSearchTitles = useSavedSearchTitles({
        savedSearches,
        PersonalDetails: personalDetails,
        reports,
        taxRates: getAllTaxRates(allPolicies),
        cardList: mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList),
        cardFeeds: allFeeds,
        policies: allPolicies,
        currentUserAccountID,
        translate,
        formatPhoneNumber,
        feedKeysWithCards,
        reportAttributes,
        bankAccountList,
    });

    const items = Object.entries(savedSearches ?? {})
        .map(([key, item]) => {
            const searchKey = savedSearchIDToSearchKey(key);
            return {
                key,
                searchKey,
                name: item.name,
                query: getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), item.query),
                title: item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name,
                isDisabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
        })
        .sort((a, b) => localeCompare(a.title, b.title));

    return items.map((item) => (
        <FlatNavItem
            key={item.key}
            label={item.title}
            isSelected={currentSearchKey === item.searchKey}
            isSubItem
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
    ));
}

export default FlatNavSavedSearches;
