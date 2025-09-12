import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React from 'react';
import FilterRenderer from '@components/Search/FilterRenderer';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NotFoundPage from '@components/NotFoundPage';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFilterConfig} from '@libs/SearchFilters/filterConfigs';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchAdvancedFiltersParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type SearchFiltersGenericPageRouteProp = RouteProp<SearchAdvancedFiltersParamList, typeof SCREENS.SEARCH.ADVANCED_FILTERS_GENERIC_RHP>;

function SearchFiltersGenericPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<SearchFiltersGenericPageRouteProp>();
    
    // Extract filter key from route params
    const filterKey = route.params?.filterKey;
    const config = getFilterConfig(filterKey);

    if (!config) {
        return <NotFoundPage />;
    }

    // For base component filters (datePreset, amount, text, boolean), 
    // the base components handle their own ScreenWrapper and HeaderWithBackButton
    if (config.type === 'datePreset' || config.type === 'amount' || config.type === 'text' || config.type === 'boolean') {
        return <FilterRenderer config={config} />;
    }

    // For custom and multiSelect filters, provide the wrapper
    return (
        <ScreenWrapper
            testID={SearchFiltersGenericPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(config.titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <FilterRenderer config={config} />
        </ScreenWrapper>
    );
}

SearchFiltersGenericPage.displayName = 'SearchFiltersGenericPage';

export default SearchFiltersGenericPage;