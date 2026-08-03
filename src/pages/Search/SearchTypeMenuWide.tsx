import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';
import type {TodoCounts} from '@hooks/useTodoCounts';

import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {getItemBadgeText, getSectionBadgeText, SEARCH_TYPE_MENU_ICON_NAMES} from '@libs/SearchUIUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';

// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

import {useRoute} from '@react-navigation/native';
import React, {useContext, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import SavedSearchList from './SavedSearchList';
import SearchTypeMenuAccordion from './SearchTypeMenuAccordion';
import SearchTypeMenuItem from './SearchTypeMenuItem';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON | undefined;
};

type SectionParams = {
    section: SearchTypeMenuSection;
    hash: number | undefined;
    activeItemIndex: number;
    sectionStartIndex: number;
    reportCounts: TodoCounts;
    onItemPress: (query: string) => void;
};

function Section({section, hash, activeItemIndex, sectionStartIndex, reportCounts, onItemPress}: SectionParams) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(SEARCH_TYPE_MENU_ICON_NAMES);

    const [isExpanded, setIsExpanded] = useState(true);

    const isSavedSearchesSection = section.translationPath === 'search.savedSearchesMenuItemTitle';

    return (
        <SearchTypeMenuAccordion
            isExpanded={isExpanded}
            onSectionHeaderPress={() => {
                setIsExpanded((prevIsExpanded) => !prevIsExpanded);
            }}
            title={translate(section.translationPath)}
            badgeText={getSectionBadgeText(section.translationPath, reportCounts)}
        >
            {isSavedSearchesSection && <SavedSearchList hash={hash} />}
            {!isSavedSearchesSection &&
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
                })}
        </SearchTypeMenuAccordion>
    );
}

function SearchTypeMenuWide({queryJSON}: SearchTypeMenuProps) {
    const {hash, similarSearchHash, sortBy, sortOrder, type} = queryJSON ?? {};

    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections({hash, similarSearchHash, sortBy, sortOrder, type});
    // Intentionally left enabled (no focus freeze): the wide menu renders in the search navigator's ExtraContent
    // slot, where useIsFocused() does not track visibility, so freezing on it would be unreliable.
    const {counts: reportCounts} = useTodoCounts();

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

    const handleTypeMenuItemPress = singleExecution((searchQuery: string) => navigateToCannedSpendSearch(searchQuery, clearSelectedTransactions));

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
                        hash={hash}
                        sectionStartIndex={0}
                        activeItemIndex={activeItemIndex}
                        reportCounts={reportCounts}
                    />
                )}

                {nonExpenseReportsSections.map((section, index) => (
                    <Section
                        key={section.translationPath}
                        section={section}
                        onItemPress={handleTypeMenuItemPress}
                        hash={hash}
                        sectionStartIndex={sectionStartIndices.at(index + (expenseReportsSection ? 1 : 0)) ?? 0}
                        activeItemIndex={activeItemIndex}
                        reportCounts={reportCounts}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

export default SearchTypeMenuWide;
