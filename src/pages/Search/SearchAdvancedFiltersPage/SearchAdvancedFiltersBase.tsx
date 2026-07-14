import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useContext} from 'react';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentDraftFilters, shouldShowResetFilters} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters} = useContext(SearchAdvancedFiltersActionContext);

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, currentDraftFilters)}
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
