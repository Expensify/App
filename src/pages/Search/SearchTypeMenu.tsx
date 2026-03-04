import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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
import SavedSearchList from './SavedSearchList';
import SearchTypeMenuItem from './SearchTypeMenuItem';
import SuggestedSearchSkeleton from './SuggestedSearchSkeleton';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {hash, similarSearchHash} = queryJSON ?? {};

    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const {typeMenuSections, CreateReportConfirmationModal, shouldShowSuggestedSearchSkeleton, activeItemIndex} = useSearchTypeMenuSections({hash, similarSearchHash});
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Basket',
        'CalendarSolid',
        'Receipt',
        'ChatBubbles',
        'MoneyBag',
        'CreditCard',
        'MoneyHourglass',
        'CreditCardHourglass',
        'ExpensifyCard',
        'Bank',
        'User',
        'Folder',
    ] as const);
    const {clearSelectedTransactions} = useSearchActionsContext();
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});

    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);
    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [route, saveScrollOffset],
    );

    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
    }, [getScrollOffset, route]);

    const sectionStartIndices = [0];
    for (const section of typeMenuSections) {
        sectionStartIndices.push((sectionStartIndices.at(-1) ?? 0) + section.menuItems.length);
    }

    const handleTypeMenuItemPress = singleExecution((searchQuery: string) => {
        clearSelectedTransactions();
        setSearchContext(false);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
    });

    return (
        <>
            {CreateReportConfirmationModal}
            <ScrollView
                onScroll={onScroll}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
            >
                {shouldShowSuggestedSearchSkeleton ? (
                    <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                        <SuggestedSearchSkeleton />
                    </View>
                ) : (
                    <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                        {typeMenuSections.map((section, sectionIndex) => (
                            <View key={section.translationPath}>
                                <Text
                                    style={styles.sectionTitle}
                                    accessibilityRole={CONST.ROLE.HEADER}
                                >
                                    {translate(section.translationPath)}
                                </Text>

                                {section.translationPath === 'search.savedSearchesMenuItemTitle' ? (
                                    <SavedSearchList hash={hash} />
                                ) : (
                                    <>
                                        {section.menuItems.map((item, itemIndex) => {
                                            const flattenedIndex = (sectionStartIndices?.at(sectionIndex) ?? 0) + itemIndex;
                                            const focused = activeItemIndex === flattenedIndex;
                                            const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;

                                            return (
                                                <SearchTypeMenuItem
                                                    key={item.key}
                                                    title={translate(item.translationPath)}
                                                    badgeStyle={styles.todoBadge}
                                                    icon={icon}
                                                    badgeText={getItemBadgeText(item.key, reportCounts)}
                                                    focused={focused}
                                                    onPress={() => handleTypeMenuItemPress(item.searchQuery)}
                                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_ITEM}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </>
    );
}

export default SearchTypeMenu;
