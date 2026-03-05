import React, {useRef} from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import type {FilterItem} from './useSearchFiltersBar';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarNarrowProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
};

function SearchFiltersBarNarrow({queryJSON, isMobileSelectionModeEnabled}: SearchFiltersBarNarrowProps) {
    const scrollRef = useRef<FlatList<FilterItem>>(null);
    const {filters, hasErrors, shouldShowFiltersBarLoading, shouldShowSelectedDropdown, filterButtonText, openAdvancedFilters, expensifyIcons, theme, styles} = useSearchFiltersBar(
        queryJSON,
        isMobileSelectionModeEnabled,
    );

    const adjustScroll = (info: {distanceFromEnd: number}) => {
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        if (!shouldAdjustScroll || info.distanceFromEnd > 0) {
            return;
        }
        scrollRef.current?.scrollToEnd();
    };

    const renderFilterItem = ({item}: {item: FilterItem}) => (
        <DropdownButton
            label={item.label}
            value={item.value}
            PopoverComponent={item.PopoverComponent}
            sentryLabel={item.sentryLabel}
        />
    );

    const renderListFooter = () => (
        <View style={[styles.flexRow, styles.gap2]}>
            <Button
                link
                small
                shouldUseDefaultHover={false}
                text={filterButtonText}
                iconFill={theme.link}
                iconHoverFill={theme.linkHover}
                icon={expensifyIcons.Filter}
                textStyles={[styles.textMicroBold]}
                onPress={openAdvancedFilters}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
            />
        </View>
    );

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'SearchFiltersBarNarrow',
            shouldShowFiltersBarLoading,
        };
        return (
            <SearchFiltersSkeleton
                shouldAnimate
                reasonAttributes={skeletonReasonAttributes}
            />
        );
    }

    return (
        <View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchFiltersBarContainer]}>
            {shouldShowSelectedDropdown ? (
                <SearchBulkActionsButton queryJSON={queryJSON} />
            ) : (
                <FlatList
                    horizontal
                    keyboardShouldPersistTaps="always"
                    style={[styles.flexRow, styles.overflowScroll, styles.flexGrow0]}
                    contentContainerStyle={[styles.flexRow, styles.flexGrow0, styles.gap2, styles.ph5]}
                    ref={scrollRef}
                    showsHorizontalScrollIndicator={false}
                    data={filters}
                    keyExtractor={(item) => item.label}
                    renderItem={renderFilterItem}
                    ListFooterComponent={renderListFooter}
                    onEndReached={adjustScroll}
                    onEndReachedThreshold={0.75}
                />
            )}
        </View>
    );
}

SearchFiltersBarNarrow.displayName = 'SearchFiltersBarNarrow';

export default SearchFiltersBarNarrow;
