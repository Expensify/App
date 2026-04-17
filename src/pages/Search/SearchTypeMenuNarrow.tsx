// NOTE: This component has a static twin in SearchPageNarrow/StaticSearchTypeMenu.tsx
// used for fast perceived performance. If you change the UI here, verify the
// static version still looks visually identical.
import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {SearchQueryJSON} from '@components/Search/types';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import type {TabSelectorBaseItem, TabSelectorItemProps} from '@components/TabSelector/types';
import useDeleteSavedSearch from '@hooks/useDeleteSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import {getItemBadgeText} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import todosReportCountsSelector from '@src/selectors/Todos';
import SavedSearchOverflowMenu from './SavedSearchOverflowMenu';
import SavedSearchTabSelectorItem from './SavedSearchTabSelectorItem';
import {SavedSearchTitleDataProvider} from './SavedSearchTitleContext';

function renderSearchPageTabItem(tab: TabSelectorBaseItem, props: TabSelectorItemProps) {
    if (tab.requiresSavedSearchTitleResolution) {
        return (
            <SavedSearchTabSelectorItem
                tabKey={props.tabKey}
                icon={props.icon}
                title={props.title}
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                backgroundColor={props.backgroundColor}
                activeOpacity={props.activeOpacity}
                inactiveOpacity={props.inactiveOpacity}
                isActive={props.isActive}
                shouldShowLabelWhenInactive={props.shouldShowLabelWhenInactive}
                testID={props.testID}
                sentryLabel={props.sentryLabel}
                shouldShowProductTrainingTooltip={props.shouldShowProductTrainingTooltip}
                renderProductTrainingTooltip={props.renderProductTrainingTooltip}
                equalWidth={props.equalWidth}
                badgeText={props.badgeText}
                isDisabled={props.isDisabled}
                pendingAction={props.pendingAction}
            />
        );
    }
    return (
        <TabSelectorItem
            tabKey={props.tabKey}
            icon={props.icon}
            title={props.title}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            backgroundColor={props.backgroundColor}
            activeOpacity={props.activeOpacity}
            inactiveOpacity={props.inactiveOpacity}
            isActive={props.isActive}
            shouldShowLabelWhenInactive={props.shouldShowLabelWhenInactive}
            testID={props.testID}
            sentryLabel={props.sentryLabel}
            shouldShowProductTrainingTooltip={props.shouldShowProductTrainingTooltip}
            renderProductTrainingTooltip={props.renderProductTrainingTooltip}
            equalWidth={props.equalWidth}
            badgeText={props.badgeText}
            isDisabled={props.isDisabled}
            pendingAction={props.pendingAction}
        />
    );
}

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
    renderItem?: (tab: TabSelectorBaseItem, props: TabSelectorItemProps) => React.ReactNode;
};

function SearchTypeMenuNarrowContent({
    tabs,
    activeTabKey,
    onActiveTabPress,
    onTabPress: onTabPressContent,
    onLongTabPress,
    containerRef,
    children,
    renderItem,
}: SearchTypeMenuNarrowContentProps) {
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
                    renderItem={renderItem}
                />
            </TabSelectorContextProvider>
            {children}
        </View>
    );
}

/**
 * Inner body: no SavedSearchTitleContext consumption — title resolution lives in
 * SavedSearchTabSelectorItem and SavedSearchOverflowMenu so Onyx-driven updates
 * do not re-render this entire subtree.
 */
function SearchTypeMenuNarrowBase({queryJSON, onTabPress}: SearchTypeMenuNarrowProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const navigation = useNavigation();
    const {typeMenuSections} = useSearchTypeMenuSections();

    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});

    const [savedSearchToModifyKey, setSavedSearchToModifyKey] = useState<string | null>(null);
    const menuAnchorRef = useRef<View>(null);
    const {showDeleteModal} = useDeleteSavedSearch();

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Receipt',
        'ChatBubbles',
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
        'ExpensifyCard',
        'Pencil',
        'Trashcan',
        'Document',
        'Send',
        'ThumbsUp',
        'CheckCircle',
    ] as const);

    const queryMap = new Map<string, {query: string; name?: string}>();
    const tabItems: TabSelectorBaseItem[] = [];
    let activeKey = '';

    const savedSearchesTabItems: TabSelectorBaseItem[] = savedSearches
        ? Object.entries(savedSearches)
              .map(([key, item]): TabSelectorBaseItem | null => {
                  if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isOffline) {
                      return null;
                  }

                  queryMap.set(key, {query: item.query ?? '', name: item.name});

                  if (queryJSON && Number(key) === queryJSON.hash) {
                      activeKey = key;
                  }

                  const requiresSavedSearchTitleResolution = item.name === item.query;
                  const title = requiresSavedSearchTitleResolution ? (item.query ?? '') : item.name;

                  return {
                      key,
                      icon: expensifyIcons.Bookmark,
                      title,
                      requiresSavedSearchTitleResolution,
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
                if (queryJSON && item.similarSearchHash === queryJSON.similarSearchHash) {
                    activeKey = item.key;
                }
            }
        }
    }

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
        if (!savedSearches?.[Number(tabKey)]) {
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
            renderItem={renderSearchPageTabItem}
        >
            <SavedSearchOverflowMenu
                savedSearchToModifyKey={savedSearchToModifyKey}
                savedSearches={savedSearches}
                expensifyIcons={expensifyIcons}
                showDeleteModal={showDeleteModal}
                menuAnchorRef={menuAnchorRef}
                onSetModifyKey={setSavedSearchToModifyKey}
            />
        </SearchTypeMenuNarrowContent>
    );
}

function SearchTypeMenuNarrow({queryJSON, onTabPress}: SearchTypeMenuNarrowProps) {
    return (
        <SavedSearchTitleDataProvider>
            <SearchTypeMenuNarrowBase
                queryJSON={queryJSON}
                onTabPress={onTabPress}
            />
        </SavedSearchTitleDataProvider>
    );
}

export {SearchTypeMenuNarrowContent};
export default SearchTypeMenuNarrow;
export type {SearchTypeMenuNarrowProps};
