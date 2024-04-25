import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import SearchFilters from './SearchFilters';

// import EmptySearchView from './EmptySearchView';

function SearchPageBottomTab() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={SearchPageBottomTab.displayName}>
            <TopBar
                breadcrumbLabel={translate('common.search')}
                shouldDisplaySearch={false}
            />
            <SearchFilters />
            {/* <EmptySearchView /> */}
            {/*  Search results list goes here  */}
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;
