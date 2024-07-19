import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AdvancedSearchFilters from './AdvancedSearchFilters';

function SearchAdvancedFiltersPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            testID={SearchAdvancedFiltersPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('search.filtersHeader')} />
                <AdvancedSearchFilters />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchAdvancedFiltersPage.displayName = 'SearchAdvancedFiltersPage';

export default SearchAdvancedFiltersPage;
