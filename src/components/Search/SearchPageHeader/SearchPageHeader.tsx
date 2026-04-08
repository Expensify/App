// NOTE: The narrow-layout rendering of this component has a static twin in
// SearchPageNarrow/StaticSearchPageHeader.tsx used for fast perceived
// performance. If you change the narrow-layout UI here, verify the static
// version still looks visually identical.
import React from 'react';
import type {SearchQueryJSON} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import SearchPageHeaderInput from './SearchPageHeaderInput';

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    handleSearch: (value: string) => void;
    isMobileSelectionModeEnabled: boolean;
    skipInputSkeleton?: boolean;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

function SearchPageHeader({
    queryJSON,
    searchRouterListVisible,
    hideSearchRouterList,
    onSearchRouterFocus,
    handleSearch,
    isMobileSelectionModeEnabled,
    skipInputSkeleton,
}: SearchPageHeaderProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (shouldUseNarrowLayout && isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    return (
        <SearchPageHeaderInput
            searchRouterListVisible={searchRouterListVisible}
            onSearchRouterFocus={onSearchRouterFocus}
            queryJSON={queryJSON}
            hideSearchRouterList={hideSearchRouterList}
            handleSearch={handleSearch}
            skipInputSkeleton={skipInputSkeleton}
        />
    );
}

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
