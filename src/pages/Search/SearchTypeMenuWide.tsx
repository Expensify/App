import {useRoute} from '@react-navigation/native';
import React, {useContext, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getItemBadgeText} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import todosReportCountsSelector from '@src/selectors/Todos';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SavedSearchList from './SavedSearchList';
import SearchTypeMenuItem from './SearchTypeMenuItem';
import SuggestedSearchSkeleton from './SuggestedSearchSkeleton';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

const SAVED_SEARCHES_TRANSLATION_PATH = 'search.savedSearchesMenuItemTitle';

function SearchTypeMenuWide({queryJSON}: SearchTypeMenuProps) {
    const {hash, similarSearchHash, sortBy, sortOrder, type} = queryJSON ?? {};

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {singleExecution} = useSingleExecution();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections({hash, similarSearchHash, sortBy, sortOrder, type});
    const [isSearchDataLoaded, isSearchDataLoadedResult] = useOnyx(ONYXKEYS.IS_SEARCH_PAGE_DATA_LOADED);
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Basket',
        'CalendarSolid',
        'Receipt',
        'MoneyBag',
        'CreditCard',
        'MoneyHourglass',
        'CreditCardHourglass',
        'Bank',
        'User',
        'Folder',
        'Document',
        'Pencil',
        'ThumbsUp',
        'CheckCircle',
    ]);

    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);
    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    };

    const handleTypeMenuItemPress = singleExecution((searchQuery: string) => {
        clearSelectedTransactions();
        setSearchContext(false);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
    });

    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
    }, [getScrollOffset, route]);

    const flatMenuItems = typeMenuSections.filter((section) => section.translationPath !== SAVED_SEARCHES_TRANSLATION_PATH).flatMap((section) => section.menuItems);
    const hasSavedSearchesSection = typeMenuSections.some((section) => section.translationPath === SAVED_SEARCHES_TRANSLATION_PATH);
    const areSuggestedSearchesLoading = !isOffline && !isSearchDataLoaded && !isLoadingOnyxValue(isSearchDataLoadedResult);

    return (
        <ScrollView
            onScroll={onScroll}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.pb4, {marginLeft: 28}]}>
                {areSuggestedSearchesLoading ? (
                    <SuggestedSearchSkeleton sectionCount={1} />
                ) : (
                    flatMenuItems.map((item, itemIndex) => {
                        const focused = activeItemIndex === itemIndex;
                        const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;
                        return (
                            <SearchTypeMenuItem
                                key={item.key}
                                title={translate(item.translationPath)}
                                icon={icon}
                                badgeText={getItemBadgeText(item.key, reportCounts)}
                                focused={focused}
                                onPress={() => handleTypeMenuItemPress(item.searchQuery)}
                            />
                        );
                    })
                )}
                {hasSavedSearchesSection && (
                    <SavedSearchList
                        hash={hash}
                        areAllSectionsExpanded
                    />
                )}
            </View>
        </ScrollView>
    );
}

export default SearchTypeMenuWide;
