import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilters from './SearchFilters';
import type IconAsset from '@src/types/utils/IconAsset';

// import EmptySearchView from './EmptySearchView';

type SearchMenuItem = {
    title: string;
    icon: IconAsset;
    action: () => void;
};

function SearchPageBottomTab() {
    return (
        <ScreenWrapper testID={SearchPageBottomTab.displayName}>
            {/* <EmptySearchView /> */}
            <SearchFilters />
            {/*  Search results list goes here  */}
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;
