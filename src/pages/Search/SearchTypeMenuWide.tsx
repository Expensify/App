import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useEffectEvent, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import {useSearchActionsContext} from '@components/Search/SearchContext';
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
import {getItemBadgeText, getSectionBadgeText} from '@libs/SearchUIUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import todosReportCountsSelector from '@src/selectors/Todos';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SavedSearchList from './SavedSearchList';
import SearchTypeMenuAccordion from './SearchTypeMenuAccordion';
import SearchTypeMenuItem from './SearchTypeMenuItem';
import SuggestedSearchSkeleton from './SuggestedSearchSkeleton';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

type SectionParams = {
    section: SearchTypeMenuSection;
    hash: number | undefined;
    activeItemIndex: number;
    sectionStartIndex: number;
    reportCounts: NonNullable<ReturnType<typeof todosReportCountsSelector>>;
    areAllSectionsExpanded: boolean;
    onItemPress: (query: string) => void;
    onCollapsed: (isCollapsed: boolean) => void;
};

function Section({section, hash, activeItemIndex, sectionStartIndex, reportCounts, areAllSectionsExpanded, onItemPress, onCollapsed}: SectionParams) {
    const {translate} = useLocalize();
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

    const [isExpanded, setIsExpanded] = useState(true);

    const onUnmount = useEffectEvent(() => {
        if (isExpanded) {
            return;
        }
        // When the section is removed/unmounted while collapsed,
        // notify the parent that the section is no longer collapsed.
        onCollapsed(false);
    });

    useEffect(() => {
        return () => onUnmount();
    }, []);

    return (
        <SearchTypeMenuAccordion
            isExpanded={isExpanded}
            onSectionHeaderPress={() => {
                setIsExpanded((prevIsExpanded) => {
                    onCollapsed(prevIsExpanded);
                    return !prevIsExpanded;
                });
            }}
            title={translate(section.translationPath)}
            badgeText={getSectionBadgeText(section.translationPath, reportCounts)}
        >
            {section.translationPath === 'search.savedSearchesMenuItemTitle' ? (
                <SavedSearchList
                    hash={hash}
                    areAllSectionsExpanded={areAllSectionsExpanded}
                />
            ) : (
                section.menuItems.map((item, itemIndex) => {
                    const flattenedIndex = sectionStartIndex + itemIndex;
                    const focused = activeItemIndex === flattenedIndex;
                    const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon] : item.icon;

                    return (
                        <SearchTypeMenuItem
                            key={item.key}
                            title={translate(item.translationPath)}
                            icon={icon}
                            badgeText={getItemBadgeText(item.key, reportCounts)}
                            focused={focused}
                            onPress={() => onItemPress(item.searchQuery)}
                        />
                    );
                })
            )}
        </SearchTypeMenuAccordion>
    );
}

function SearchTypeMenuWide({queryJSON}: SearchTypeMenuProps) {
    const {hash, similarSearchHash, sortBy, sortOrder, type} = queryJSON ?? {};

    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {singleExecution} = useSingleExecution();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections({hash, similarSearchHash, sortBy, sortOrder, type});
    const [isSearchDataLoaded, isSearchDataLoadedResult] = useOnyx(ONYXKEYS.IS_SEARCH_PAGE_DATA_LOADED);
    const [reportCounts = CONST.EMPTY_TODOS_REPORT_COUNTS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});

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

    const sectionStartIndices = [0];
    for (const section of typeMenuSections) {
        sectionStartIndices.push((sectionStartIndices.at(-1) ?? 0) + section.menuItems.length);
    }
    const expenseReportsSection = typeMenuSections.find((section) => section.translationPath === 'search.tabs.expenseReports');
    const nonExpenseReportsSections = typeMenuSections.filter((section) => section.translationPath !== 'search.tabs.expenseReports');

    const areSuggestedSearchesLoading = !isOffline && !isSearchDataLoaded && !isLoadingOnyxValue(isSearchDataLoadedResult);

    const [collapsedSectionCount, setCollapsedSectionCount] = useState(0);
    const areAllSectionsExpanded = collapsedSectionCount === 0;

    const updateCollapsedCount = (isCollapsed: boolean) => {
        setCollapsedSectionCount((prevCollapsedCount) => prevCollapsedCount + (isCollapsed ? 1 : -1));
    };

    return (
        <ScrollView
            onScroll={onScroll}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.pb4, styles.mh3, styles.gap4]}>
                {!!expenseReportsSection && (
                    <Section
                        section={expenseReportsSection}
                        onItemPress={handleTypeMenuItemPress}
                        onCollapsed={updateCollapsedCount}
                        hash={hash}
                        sectionStartIndex={0}
                        activeItemIndex={activeItemIndex}
                        reportCounts={reportCounts}
                        areAllSectionsExpanded={areAllSectionsExpanded}
                    />
                )}

                {areSuggestedSearchesLoading ? (
                    <SuggestedSearchSkeleton sectionCount={nonExpenseReportsSections.length || 2} />
                ) : (
                    nonExpenseReportsSections.map((section, index) => (
                        <Section
                            key={section.translationPath}
                            section={section}
                            onItemPress={handleTypeMenuItemPress}
                            onCollapsed={updateCollapsedCount}
                            hash={hash}
                            sectionStartIndex={sectionStartIndices.at(index + (expenseReportsSection ? 1 : 0)) ?? 0}
                            activeItemIndex={activeItemIndex}
                            reportCounts={reportCounts}
                            areAllSectionsExpanded={areAllSectionsExpanded}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
}

export default SearchTypeMenuWide;
