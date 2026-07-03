import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';

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
                policyID={currentDraftFilters.policyID}
                onPress={(filterKey) => Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(filterKey))}
            />
            <View style={[styles.ph5, styles.pb5, isInLandscapeMode ? [styles.flexRow, styles.gap2] : [styles.gap3]]}>
                {shouldShowResetFilters && (
                    <Button
                        style={[isInLandscapeMode ? styles.flex1 : undefined]}
                        large
                        text={translate('common.reset')}
                        onPress={resetFilters}
                    />
                )}
                <Button
                    style={[isInLandscapeMode ? styles.flex1 : undefined]}
                    success
                    large
                    text={translate('search.applyFilters')}
                    onPress={applyFilters}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersBase;
