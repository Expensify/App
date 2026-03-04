import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {SearchQueryJSON} from '@components/Search/types';
import ScrollableTabSelectorBase from '@components/TabSelector/ScrollableTabSelector/ScrollableTabSelectorBase';
import ScrollableTabSelectorContextProvider from '@components/TabSelector/ScrollableTabSelector/ScrollableTabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import {setSearchContext} from '@libs/actions/Search';
import {getItemBadgeText} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import todosReportCountsSelector from '@src/selectors/Todos';

type SearchPageTabSelectorProps = {
    queryJSON?: SearchQueryJSON;
};

function SearchPageTabSelector({queryJSON}: SearchPageTabSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const navigation = useNavigation();
    const {typeMenuSections} = useSearchTypeMenuSections();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});
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
        const todoItemsCount = getItemBadgeText(item.key, reportCounts);
        const title = translate(item.translationPath);

        tabItems.push({
            key: item.key,
            icon,
            title: todoItemsCount ? `${title} (${todoItemsCount})` : title,
        });
        queryMap.set(item.key, {query: item.searchQuery});
        if (queryJSON && item.similarSearchHash === queryJSON.similarSearchHash) {
            activeKey = item.key;
        }
    }

    if (savedSearches) {
        for (const [key, item] of Object.entries(savedSearches)) {
            tabItems.push({
                key,
                icon: expensifyIcons.Bookmark,
                title: item.name,
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
        setSearchContext(false);
        navigation.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {
                params: {q: searchData.query, name: searchData.name},
            },
        });
    };

    return (
        <View style={[styles.appBG]}>
            <ScrollableTabSelectorContextProvider activeTabKey={activeKey}>
                <ScrollableTabSelectorBase
                    tabs={tabItems}
                    activeTabKey={activeKey}
                    onTabPress={handleTabPress}
                />
            </ScrollableTabSelectorContextProvider>
        </View>
    );
}

export default SearchPageTabSelector;
