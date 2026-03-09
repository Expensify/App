import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchFiltersSkeleton from '@components/Skeletons/SearchFiltersSkeleton';
import CONST from '@src/CONST';
import SearchFiltersBarCreateButton from './SearchFiltersBarCreateButton';
import useSearchFiltersBar from './useSearchFiltersBar';

type SearchFiltersBarWideProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
};

function SearchFiltersBarWide({queryJSON, isMobileSelectionModeEnabled}: SearchFiltersBarWideProps) {
    const {
        filters,
        hasErrors,
        shouldShowFiltersBarLoading,
        shouldShowSelectedDropdown,
        shouldShowColumnsButton,
        filterButtonText,
        openAdvancedFilters,
        openSearchColumns,
        expensifyIcons,
        theme,
        styles,
        translate,
    } = useSearchFiltersBar(queryJSON, isMobileSelectionModeEnabled);

    if (hasErrors) {
        return null;
    }

    if (shouldShowFiltersBarLoading) {
        return <SearchFiltersSkeleton shouldAnimate />;
    }

    return (
        <View style={[shouldShowSelectedDropdown && styles.ph5, styles.mb2, styles.searchFiltersBarContainer, styles.gap5]}>
            {shouldShowSelectedDropdown ? (
                <SearchBulkActionsButton queryJSON={queryJSON} />
            ) : (
                <>
                    <View style={[styles.flexRow, styles.flexWrap, styles.flexShrink1, styles.gap2, styles.ph5]}>
                        {filters.map((item) => (
                            <DropdownButton
                                key={item.label}
                                label={item.label}
                                value={item.value}
                                PopoverComponent={item.PopoverComponent}
                                sentryLabel={item.sentryLabel}
                            />
                        ))}
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
                            {shouldShowColumnsButton && (
                                <Button
                                    link
                                    small
                                    shouldUseDefaultHover={false}
                                    text={translate('search.columns')}
                                    iconFill={theme.link}
                                    iconHoverFill={theme.linkHover}
                                    icon={expensifyIcons.Columns}
                                    textStyles={[styles.textMicroBold]}
                                    onPress={openSearchColumns}
                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.COLUMNS_BUTTON}
                                />
                            )}
                        </View>
                    </View>
                    <SearchFiltersBarCreateButton />
                </>
            )}
        </View>
    );
}

SearchFiltersBarWide.displayName = 'SearchFiltersBarWide';

export default SearchFiltersBarWide;
