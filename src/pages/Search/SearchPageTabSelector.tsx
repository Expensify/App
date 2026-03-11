import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import ScrollableTabSelectorBase from '@components/TabSelector/ScrollableTabSelector/ScrollableTabSelectorBase';
import ScrollableTabSelectorContextProvider from '@components/TabSelector/ScrollableTabSelector/ScrollableTabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import {getItemBadgeText} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/Session';
import todosReportCountsSelector from '@src/selectors/Todos';

type SearchPageTabSelectorProps = {
    /** Search query JSON */
    queryJSON?: SearchQueryJSON;
    /** Function to call when a tab is pressed */
    onTabPress?: () => void;
};

function SearchPageTabSelector({queryJSON, onTabPress}: SearchPageTabSelectorProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    const {typeMenuSections} = useSearchTypeMenuSections();
    const personalDetails = usePersonalDetails();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [workspaceCardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    const taxRates = getAllTaxRates(allPolicies);
    const cardsForSavedSearchDisplay = mergeCardListWithWorkspaceFeeds(workspaceCardList ?? CONST.EMPTY_OBJECT, cardList);

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
    ] as const);

    const flattenedItems = typeMenuSections.flatMap((section) => section.menuItems);
    const queryMap = new Map<string, {query: string; name?: string}>();
    const tabItems: TabSelectorBaseItem[] = [];
    let activeKey = '';

    for (const item of flattenedItems) {
        const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;
        const badgeText = getItemBadgeText(item.key, reportCounts);
        const title = translate(item.translationPath);

        tabItems.push({
            key: item.key,
            icon,
            title,
            badgeText,
        });
        queryMap.set(item.key, {query: item.searchQuery});
        if (queryJSON && item.similarSearchHash === queryJSON.similarSearchHash) {
            activeKey = item.key;
        }
    }

    console.log({savedSearches});

    if (savedSearches) {
        for (const [key, item] of Object.entries(savedSearches)) {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isOffline) {
                continue;
            }

            let title = item.name;
            if (queryJSON && title === item.query) {
                title = buildUserReadableQueryString({
                    queryJSON,
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
                });
            }

            tabItems.push({
                key,
                icon: expensifyIcons.Bookmark,
                title,
                disabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: item.pendingAction,
            });
            queryMap.set(key, {query: item.query ?? '', name: item.name});

            if (queryJSON && Number(key) === queryJSON.hash) {
                activeKey = key;
            }
        }
    }

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

    return (
        <View style={[styles.appBG]}>
            <ScrollableTabSelectorContextProvider activeTabKey={activeKey}>
                <ScrollableTabSelectorBase
                    tabs={tabItems}
                    activeTabKey={activeKey}
                    forceOnTabPressWhenActive
                    onTabPress={handleTabPress}
                />
            </ScrollableTabSelectorContextProvider>
        </View>
    );
}

export default SearchPageTabSelector;
