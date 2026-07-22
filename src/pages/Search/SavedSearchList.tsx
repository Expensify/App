import MenuItemList from '@components/MenuItemList';
import {useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {useSearchQueryActions, useSearchQueryContext} from '@components/Search/SearchContext';

import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShareSavedSearch from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, getValidLastQuery} from '@libs/SearchQueryUtils';
import type {SavedSearchMenuItem, SearchKey} from '@libs/SearchUIUtils';
import {createBaseSavedSearchMenuItem, getOverflowMenu as getOverflowMenuUtil, savedSearchIDToSearchKey} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

import {useIsFocused} from '@react-navigation/native';
import {accountIDSelector} from '@selectors/Session';
import React from 'react';

import useSavedSearchTitles from './hooks/useSavedSearchTitles';
import SavedSearchItemThreeDotMenu from './SavedSearchItemThreeDotMenu';
import SearchTypeMenuItem from './SearchTypeMenuItem';

type SavedSearchListProps = {
    areAllSectionsExpanded: boolean;
};

type SavedSearchMenuItemBuilderParams = {
    item: SaveSearchItem;
    itemQuery: string;
    key: string;
    index: number;
    currentSearchKey: SearchKey | undefined;
    title: string;
    onPress: (searchKey: SearchKey) => void;
    getOverflowMenu: (itemName: string, itemSavedSearchID: string, itemQuery: string) => ReturnType<typeof getOverflowMenuUtil>;
    shouldShowSavedSearchTooltip: boolean;
    hideSavedSearchTooltip: (() => void) | undefined;
    renderSavedSearchTooltip: () => React.JSX.Element;
    itemStyle: SavedSearchMenuItem['style'];
    tooltipWrapperStyle: SavedSearchMenuItem['tooltipWrapperStyle'];
    isCopied: boolean;
};

function buildSavedSearchMenuItem({
    item,
    itemQuery,
    key,
    index,
    currentSearchKey,
    title,
    onPress,
    getOverflowMenu,
    shouldShowSavedSearchTooltip,
    hideSavedSearchTooltip,
    renderSavedSearchTooltip,
    itemStyle,
    tooltipWrapperStyle,
    isCopied,
}: SavedSearchMenuItemBuilderParams): SavedSearchMenuItem {
    const savedSearchKey = savedSearchIDToSearchKey(key);
    const isItemFocused = savedSearchKey === currentSearchKey;
    const baseMenuItem: SavedSearchMenuItem = createBaseSavedSearchMenuItem(item, key, index, title, isItemFocused);

    return {
        ...baseMenuItem,
        role: CONST.ROLE.TAB,
        sentryLabel: CONST.SENTRY_LABEL.SEARCH.SAVED_SEARCH_MENU_ITEM,
        onPress: () => {
            setSearchContext(false);
            onPress(savedSearchKey);
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: itemQuery, name: item?.name}));
        },
        rightComponent: (
            <SavedSearchItemThreeDotMenu
                menuItems={getOverflowMenu(title, key, item.query)}
                isDisabledItem={item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                hideProductTrainingTooltip={index === 0 && shouldShowSavedSearchTooltip ? hideSavedSearchTooltip : undefined}
                shouldRenderTooltip={index === 0 && shouldShowSavedSearchTooltip}
                renderTooltipContent={renderSavedSearchTooltip}
                isCopied={isCopied}
            />
        ),
        style: itemStyle,
        tooltipAnchorAlignment: {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        },
        tooltipShiftHorizontal: variables.savedSearchShiftHorizontal,
        tooltipShiftVertical: variables.savedSearchShiftVertical,
        tooltipWrapperStyle,
        renderTooltipContent: renderSavedSearchTooltip,
    };
}

function SavedSearchList({areAllSectionsExpanded}: SavedSearchListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();
    const isFocused = useIsFocused();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetails = usePersonalDetails();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const reportAttributes = useReportAttributes();
    const {currentSearchKey, currentSearchHash} = useSearchQueryContext();
    const {setCurrentSearchKey} = useSearchQueryActions();

    const {showDeleteModal} = useDeleteSavedSearch();
    const {
        shouldShowProductTrainingTooltip: shouldShowSavedSearchTooltip,
        renderProductTrainingTooltip: renderSavedSearchTooltip,
        hideProductTrainingTooltip: hideSavedSearchTooltip,
    } = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH, isFocused && areAllSectionsExpanded);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark', 'Pencil', 'Trashcan', 'LinkCopy', 'Checkmark']);
    const {copiedID, handleShare} = useShareSavedSearch();

    const taxRates = getAllTaxRates(allPolicies);
    const cardsForSavedSearchDisplay = mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList);

    const savedSearchTitles = useSavedSearchTitles({
        savedSearches,
        PersonalDetails: personalDetails,
        reports,
        taxRates,
        cardList: cardsForSavedSearchDisplay,
        cardFeeds: allFeeds,
        policies: allPolicies,
        currentUserAccountID,
        translate,
        feedKeysWithCards,
        reportAttributes,
        bankAccountList,
    });

    const getOverflowMenu = (itemName: string, itemID: string, itemQuery: string) =>
        getOverflowMenuUtil(expensifyIcons, itemName, itemID, itemQuery, translate, showDeleteModal, false, undefined, {
            onShare: () => handleShare(itemID, itemQuery),
            isCopied: copiedID === itemID,
        });

    const itemStyle = [styles.alignItemsCenter];
    const tooltipWrapperStyle = [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper];

    const savedSearchesMenuItems = savedSearches
        ? Object.entries(savedSearches)
              .map(([key, item], index) => {
                  const itemQuery = getValidLastQuery(searchFilters?.[savedSearchIDToSearchKey(key)], item.query);
                  return buildSavedSearchMenuItem({
                      item,
                      itemQuery,
                      key,
                      index,
                      currentSearchKey,
                      title: item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name,
                      onPress: (savedSearchKey) => setCurrentSearchKey(savedSearchKey, buildSearchQueryJSON(itemQuery)?.hash !== currentSearchHash),
                      getOverflowMenu,
                      shouldShowSavedSearchTooltip,
                      hideSavedSearchTooltip,
                      renderSavedSearchTooltip,
                      itemStyle,
                      tooltipWrapperStyle,
                      isCopied: copiedID === key,
                  });
              })
              .sort((a, b) => localeCompare(a.title ?? '', b.title ?? ''))
        : [];

    if (isVisuallyCollapsed) {
        return savedSearchesMenuItems.map((item) => (
            <SearchTypeMenuItem
                key={item.key}
                title={item.title ?? ''}
                icon={expensifyIcons.Bookmark}
                focused={item.focused}
                onPress={(event) => {
                    if (item.disabled || !item.onPress || !event) {
                        return;
                    }
                    return item.onPress(event);
                }}
            />
        ));
    }

    return (
        <MenuItemList
            menuItems={savedSearchesMenuItems}
            wrapperStyle={[styles.sectionMenuItem(shouldUseNarrowLayout), styles.searchTypeMenuItemPadding]}
            icon={expensifyIcons.Bookmark}
            iconWidth={variables.iconSizeNormal}
            iconHeight={variables.iconSizeNormal}
            shouldUseSingleExecution
        />
    );
}

export default SavedSearchList;
