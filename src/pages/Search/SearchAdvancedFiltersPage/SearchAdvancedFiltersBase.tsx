import React, {useContext} from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchAdvancedFilterList from '@components/Search/SearchAdvancedFilterList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '../SearchAdvancedFiltersProvider';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldShowResetFilters} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters} = useContext(SearchAdvancedFiltersActionContext);

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            <SearchAdvancedFilterList
                contentContainerStyle={[styles.pb5]}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
            {shouldShowResetFilters && (
                <Button
                    style={[styles.ph5, styles.pb3]}
                    large
                    text={translate('common.reset')}
                    onPress={resetFilters}
                />
            )}
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                large
                text={translate('search.applyFilters')}
                onPress={applyFilters}
            />
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
