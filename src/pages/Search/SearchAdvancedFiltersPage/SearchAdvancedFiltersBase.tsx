import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import SpacerView from '@components/SpacerView';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            <MenuItem
                title={translate('search.filters.describeSearch.title')}
                icon={icons.Sparkles}
                shouldShowRightIcon
                onPress={() => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIBE)}
            />
            <SpacerView
                shouldShow
                style={[styles.reportHorizontalRule]}
            />
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                policyID={getFilterNegatableValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, currentDraftFilters)}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
            {shouldShowResetFilters && (
                <Button
                    style={[styles.ph5, styles.pb3]}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={resetFilters}
                >
                    <Button.Text>{translate('common.reset')}</Button.Text>
                </Button>
            )}
            <Button
                style={[styles.ph5, styles.pb5]}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={applyFilters}
            >
                <Button.Text>{translate('search.applyFilters')}</Button.Text>
            </Button>
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
