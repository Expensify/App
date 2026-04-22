// NOTE: This component has a static twin in SearchPageNarrow/StaticSearchTypeMenu.tsx
// used for fast perceived performance. If you change the UI here, verify the
// static version still looks visually identical.
import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type BaseModalProps from '@components/Modal/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import {getItemBadgeText, getOverflowMenu} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/Session';
import todosReportCountsSelector from '@src/selectors/Todos';

type SearchTypeMenuNarrowProps = {
    /** Search query JSON */
    queryJSON?: SearchQueryJSON;
    /** Function to call when a tab is pressed */
    onTabPress?: () => void;
};

type SearchTypeMenuNarrowContentProps = {
    tabs: TabSelectorBaseItem[];
    activeTabKey: string;
    onActiveTabPress?: (key: string) => void;
    onTabPress?: (key: string) => void;
    onLongTabPress?: (key: string) => void;
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
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const navigation = useNavigation();
    const {typeMenuSections} = useSearchTypeMenuSections();
    const personalDetails = usePersonalDetails();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const reportAttributes = useReportAttributes();

    const taxRates = getAllTaxRates(allPolicies);
    const cardsForSavedSearchDisplay = mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList);

    const [savedSearchToModifyKey, setSavedSearchToModifyKey] = useState<string | null>(null);
    const menuAnchorRef = useRef<View>(null);
    const {showDeleteModal} = useDeleteSavedSearch();

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
        'Document',
        'ThumbsUp',
        'CheckCircle',
    ]);

    const queryMap = new Map<string, {query: string; name?: string}>();
    const tabItems: TabSelectorBaseItem[] = [];
    const savedSearchesPopoverMenuItems: Record<string, PopoverMenuItem[]> = {};
    let activeKey = '';

    const savedSearchesTabItems: TabSelectorBaseItem[] = savedSearches
        ? Object.entries(savedSearches)
              .map(([key, item]): TabSelectorBaseItem | null => {
                  if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isOffline) {
                      return null;
                  }

                  let title = item.name;
                  const itemJsonQuery = buildSearchQueryJSON(item.query);
                  if (queryJSON && itemJsonQuery && title === item.query) {
                      title = buildUserReadableQueryString({
                          queryJSON: itemJsonQuery,
                          PersonalDetails: personalDetails,
                          reports,
                          taxRates,
                          cardList: cardsForSavedSearchDisplay,
                          cardFeeds: allFeeds,
                          policies: allPolicies,
                          currentUserAccountID,
                          autoCompleteWithSpace: false,
                          translate,
                          feedKeysWithCards,
                          reportAttributes,
                      });
                  }

                  queryMap.set(key, {query: item.query ?? '', name: item.name});
                  savedSearchesPopoverMenuItems[key] = getOverflowMenu(expensifyIcons, title, Number(key), item.query, translate, showDeleteModal, true, () =>
                      setSavedSearchToModifyKey(null),
                  );

                  if (Number(key) === queryJSON?.hash) {
                      activeKey = key;
                  }

                  return {
                      key,
                      icon: expensifyIcons.Bookmark,
                      title,
                      isDisabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      pendingAction: item.pendingAction,
                  };
              })
              .filter((item) => item !== null)
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
                });
                queryMap.set(item.key, {query: item.searchQuery});
                if (item.similarSearchHash === queryJSON?.similarSearchHash) {
                    activeKey = item.key;
                }
            }
        }
    }

    const popoverMenuItems = savedSearchToModifyKey ? savedSearchesPopoverMenuItems?.[savedSearchToModifyKey] : [];
    const shouldShowSavedSearchPopover = savedSearchToModifyKey && popoverMenuItems.length > 0;

    const handleActiveTabPress = (tabKey: string) => {
        const searchData = queryMap.get(tabKey);
        if (!searchData) {
            return;
        }
        onTabPress?.();
        setSearchContext(false);
    };

    const handleTabPress = (tabKey: string) => {
        const searchData = queryMap.get(tabKey);
        if (!searchData) {
            return;
        }
        onTabPress?.();
        setSearchContext(false);
        navigation.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {
                params: {q: searchData.query, name: searchData.name, rawQuery: undefined},
            },
        });
    };

    const handleLongTabPress = (tabKey: string) => {
        if (!savedSearchesPopoverMenuItems?.[tabKey]) {
            return;
        }

        setSavedSearchToModifyKey(tabKey);
    };

    return (
        <SearchTypeMenuNarrowContent
            tabs={tabItems}
            activeTabKey={activeKey}
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
                onItemSelected={() => {
                    setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
                    setSavedSearchToModifyKey(null);
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
