/**
 * Full-screen page (narrow layout / RHP) wrapping the "Describe your search" natural-language filter input.
 */
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchNLFilterContent from '@components/Search/FilterComponents/AdvancedFilters/SearchNLFilterContent';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import React from 'react';

function SearchNLFilterPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleSuccess = (route: Route) => {
        Navigation.dismissModal({afterTransition: () => Navigation.navigate(route)});
    };

    return (
        <ScreenWrapper
            testID="SearchNLFilterPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.describeSearch.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS)}
            />
            <SearchNLFilterContent onSuccess={handleSuccess} />
        </ScreenWrapper>
    );
}

export default SearchNLFilterPage;
