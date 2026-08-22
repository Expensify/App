import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

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
            <View style={isInLandscapeMode ? [styles.flexRow, styles.gap2] : [styles.gap3]}>
                {shouldShowResetFilters && (
                    <Button
                        style={[styles.ph5, isInLandscapeMode ? styles.flex1 : undefined]}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={resetFilters}
                    >
                        <Button.Text>{translate('common.reset')}</Button.Text>
                    </Button>
                )}
                <Button
                    style={[styles.ph5, styles.pb5, isInLandscapeMode ? styles.flex1 : undefined]}
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
