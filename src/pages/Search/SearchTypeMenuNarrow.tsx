import type BaseModalProps from '@components/Modal/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchQueryActions, useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useShareSavedSearch, {MENU_CLOSE_DELAY_MS} from '@hooks/useShareSavedSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';

import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, getValidLastQuery} from '@libs/SearchQueryUtils';
import {getItemBadgeText, getOverflowMenu, savedSearchIDToSearchKey} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/Session';

// NOTE: This component has a static twin in SearchPageNarrow/StaticSearchTypeMenu.tsx
// used for fast perceived performance. If you change the UI here, verify the
// static version still looks visually identical.
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import useSavedSearchTitles from './hooks/useSavedSearchTitles';

type SearchTypeMenuNarrowProps = {
    /** Search query JSON */
    queryJSON?: SearchQueryJSON;
    /** Function to call when a tab is pressed */
    onTabPress?: () => void;
};

type SearchTypeMenuNarrowContentProps = {
    tabs: Array<TabSelectorBaseItem<SearchKey>>;
    activeTabKey: SearchKey | undefined;
    onActiveTabPress?: (key: SearchKey) => void;
    onTabPress?: (key: SearchKey) => void;
    onLongTabPress?: (key: SearchKey) => void;
    containerRef?: React.RefObject<View | null>;
    children?: React.ReactNode;
};

function SearchTypeMenuNarrowContent({tabs, activeTabKey, onActiveTabPress, onTabPress: onTabPressContent, onLongTabPress, containerRef, children}: SearchTypeMenuNarrowContentProps) {
    const styles = useThemeStyles();

    return (
        <View
            ref={containerRef}
            style={[styles.appBG]}
        >
            <TabSelectorContextProvider activeTabKey={activeTabKey}>
                <TabSelectorBase
                    tabs={tabs}
                    activeTabKey={activeTabKey}
                    onActiveTabPress={onActiveTabPress}
                    onTabPress={onTabPressContent}
                    onLongTabPress={onLongTabPress}
                />
            </TabSelectorContextProvider>
            {children}
        </View>
    );
}

function SearchTypeMenuNarrow({queryJSON, onTabPress}: SearchTypeMenuNarrowProps) {
    const {isOffline} = useNetwork();
    const navigation = useNavigation();
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const typeMenuSections = useSearchTypeMenuSections(isFocused);
    const personalDetails = usePersonalDetails();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const {counts: reportCounts} = useTodoCounts(isFocused);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const reportAttributes = useReportAttributes();
    const {currentSearchKey, currentSearchHash} = useSearchQueryContext();
    const {setCurrentSearchKey} = useSearchQueryActions();

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
        enabled: !!queryJSON,
    });

    const [savedSearchToModifyKey, setSavedSearchToModifyKey] = useState<SearchKey | null>(null);
    const menuAnchorRef = useRef<View>(null);
    const {showDeleteModal} = useDeleteSavedSearch();

    const {copiedID, handleShare} = useShareSavedSearch();

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Receipt',
        'MoneyBag',
        'CreditCard',
        'MoneyHourglass',
        'CreditCardHourglass',
        'Bank',
        'User',
        'Folder',
        'Basket',
        'CalendarSolid',
        'Bookmark',
        'Pencil',
        'Trashcan',
        'LinkCopy',
        'Checkmark',
        'Document',
        'ThumbsUp',
        'CheckCircle',
    ]);

    const queryMap = new Map<SearchKey, {query: string; name?: string}>();
    const tabItems: Array<TabSelectorBaseItem<SearchKey>> = [];
    const savedSearchesPopoverMenuItems: Partial<Record<SearchKey, PopoverMenuItem[]>> = {};

    const savedSearchesTabItems: Array<TabSelectorBaseItem<SearchKey>> = savedSearches
        ? Object.entries(savedSearches)
              .map(([key, item]): TabSelectorBaseItem<SearchKey> | null => {
                  if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isOffline) {
                      return null;
                  }

                  const title = item.name === item.query ? (savedSearchTitles.get(item.query) ?? item.name) : item.name;

                  const savedSearchKey = savedSearchIDToSearchKey(key);
                  queryMap.set(savedSearchKey, {query: item.query ?? '', name: item.name});
                  savedSearchesPopoverMenuItems[savedSearchKey] = getOverflowMenu(
                      expensifyIcons,
                      title,
                      key,
                      item.query,
                      translate,
                      showDeleteModal,
                      true,
                      () => setSavedSearchToModifyKey(null),
                      {
                          onShare: () => {
                              handleShare(key, item.query);
                              setTimeout(() => setSavedSearchToModifyKey(null), MENU_CLOSE_DELAY_MS);
                          },
                          isCopied: copiedID === key,
                      },
                  );

                  return {
                      key: savedSearchKey,
                      icon: expensifyIcons.Bookmark,
                      title,
                      isDisabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      pendingAction: item.pendingAction,
                  };
              })
              .filter((item) => item !== null)
              .sort((a, b) => localeCompare(a?.title ?? '', b?.title ?? ''))
        : [];

    for (const section of typeMenuSections) {
        if (section.translationPath === 'search.savedSearchesMenuItemTitle') {
            tabItems.push(...savedSearchesTabItems);
        } else {
            for (const item of section.menuItems) {
                const badgeText = getItemBadgeText(item.key, reportCounts);
                const title = translate(item.translationPath);

                tabItems.push({
                    key: item.key,
                    icon: expensifyIcons[item.icon],
                    title,
                    badgeText,
                    isBadgeCondensed: true,
                    badgeStyles: styles.tabSelectorBadge,
                });
                queryMap.set(item.key, {query: item.searchQuery});
            }
        }
    }

    const popoverMenuItems = savedSearchToModifyKey ? (savedSearchesPopoverMenuItems?.[savedSearchToModifyKey] ?? []) : [];
    const shouldShowSavedSearchPopover = savedSearchToModifyKey && popoverMenuItems.length > 0;

    const handleActiveTabPress = (tabKey: SearchKey) => {
        const searchData = queryMap.get(tabKey);
        if (!searchData) {
            return;
        }
        onTabPress?.();
        setCurrentSearchKey(tabKey);
        setSearchContext(false);
    };

    const handleTabPress = (tabKey: SearchKey) => {
        const searchData = queryMap.get(tabKey);
        if (!searchData) {
            return;
        }
        onTabPress?.();
        const query = getValidLastQuery(searchFilters?.[tabKey], searchData.query);
        setCurrentSearchKey(tabKey, buildSearchQueryJSON(query)?.hash !== currentSearchHash);
        setSearchContext(false);
        navigation.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {
                params: {q: query, name: searchData.name, rawQuery: undefined},
            },
        });
    };

    const handleLongTabPress = (tabKey: SearchKey) => {
        if (!savedSearchesPopoverMenuItems?.[tabKey]) {
            return;
        }

        setSavedSearchToModifyKey(tabKey);
    };

    return (
        <SearchTypeMenuNarrowContent
            tabs={tabItems}
            activeTabKey={currentSearchKey}
            onActiveTabPress={handleActiveTabPress}
            onTabPress={handleTabPress}
            onLongTabPress={handleLongTabPress}
            containerRef={menuAnchorRef}
        >
            <PopoverMenu
                onClose={() => setSavedSearchToModifyKey(null)}
                onModalHide={() => setRestoreFocusType(undefined)}
                isVisible={!!shouldShowSavedSearchPopover}
                // This component is only displayed when isSmallScreenWidth is true, so
                // anchorPosition is ignored anyway
                anchorPosition={{horizontal: 0, vertical: 0}}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                onItemSelected={(item) => {
                    setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
                    if (item?.shouldCloseModalOnSelect !== false) {
                        setSavedSearchToModifyKey(null);
                    }
                }}
                menuItems={popoverMenuItems}
                anchorRef={menuAnchorRef}
                shouldEnableNewFocusManagement
                restoreFocusType={restoreFocusType}
            />
        </SearchTypeMenuNarrowContent>
    );
}

export {SearchTypeMenuNarrowContent};
export default SearchTypeMenuNarrow;
export type {SearchTypeMenuNarrowProps};
