import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useContext} from 'react';
import {View} from 'react-native';

function SearchAdvancedFiltersBase() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentDraftFilters, shouldShowResetFilters} = useContext(SearchAdvancedFiltersContext);
    const {applyFilters, resetFilters} = useContext(SearchAdvancedFiltersActionContext);
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();
    const canUseNLFilters = isBetaEnabled(CONST.BETAS.NL_FILTERS);

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.filtersHeader')} />
            {canUseNLFilters && (
                <Button
                    style={[styles.mh5, styles.mb3]}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH_NL_FILTER)}
                >
                    <Button.Text>{translate('search.filters.describeSearch.title')}</Button.Text>
                </Button>
            )}
            <FilterList
                contentContainerStyle={[styles.pb5]}
                type={currentDraftFilters.type}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
            <View style={[isInLandscapeMode ? [styles.flexRow, styles.gap2] : [styles.gap3], styles.ph5, styles.pb5]}>
                {shouldShowResetFilters && (
                    <Button
                        style={[isInLandscapeMode ? styles.flex1 : undefined]}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={resetFilters}
                    >
                        <Button.Text>{translate('common.reset')}</Button.Text>
                    </Button>
                )}
                <Button
                    style={[isInLandscapeMode ? styles.flex1 : undefined]}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={applyFilters}
                >
                    <Button.Text>{translate('search.applyFilters')}</Button.Text>
                </Button>
            </View>
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
