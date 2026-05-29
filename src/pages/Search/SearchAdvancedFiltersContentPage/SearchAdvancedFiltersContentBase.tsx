import {useRoute} from '@react-navigation/core';
import React, {useContext} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FilterContent from '@components/Search/FilterComponents/AdvancedFilters/FilterContent';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchAdvancedFiltersParamList} from '@libs/Navigation/types';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import {SearchAdvancedFiltersActionContext, SearchAdvancedFiltersContext} from '@pages/Search/SearchAdvancedFiltersProvider';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function isFilterKeyValid(filterKey: string): filterKey is SearchFilter['key'] {
    return filterKey in FILTER_VIEW_MAP;
}

function SearchAdvancedFiltersContentBase() {
    const route = useRoute<PlatformStackRouteProp<SearchAdvancedFiltersParamList, typeof SCREENS.SEARCH.ADVANCED_FILTERS_CONTENT_RHP>>();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {currentSearchQueryJSON} = useSearchQueryContext();
    const filterKey = route.params.filterKey;
    const {currentDraftFilters} = useContext(SearchAdvancedFiltersContext);
    const {setDraftFilters} = useContext(SearchAdvancedFiltersActionContext);

    const validFilterKey = isFilterKeyValid(filterKey) ? filterKey : undefined;

    const goBack = () => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    return (
        <ScreenWrapper
            testID="SearchAdvancedFiltersPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) =>
                validFilterKey ? (
                    <>
                        <HeaderWithBackButton
                            title={translate(FILTER_VIEW_MAP[validFilterKey].labelKey)}
                            onBackButtonPress={goBack}
                        />
                        <View style={[styles.filterContentContainer]}>
                            <FilterContent
                                values={currentDraftFilters}
                                filterKey={validFilterKey}
                                policyIDQuery={currentSearchQueryJSON?.policyID}
                                autoFocus
                                ready={didScreenTransitionEnd}
                                onChange={(newValues) => {
                                    setDraftFilters(newValues);
                                    goBack();
                                }}
                            />
                        </View>
                    </>
                ) : (
                    <FullPageNotFoundView shouldShow />
                )
            }
        </ScreenWrapper>
    );
}

export default SearchAdvancedFiltersContentBase;
