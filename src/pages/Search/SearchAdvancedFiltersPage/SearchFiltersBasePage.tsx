import React from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import type {SearchFilterKey} from '@components/Search/types';
import useSearchFilters from '@hooks/useSearchFilters';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type SearchFiltersBasePageProps = {
    /** The key of the filter */
    key: SearchFilterKey;

    /** The title to display in the header */
    title: string;

    /** The child component that will be rendered as the list */
    children: React.ReactNode;
};

function SearchFiltersBasePage({key, title, children}: SearchFiltersBasePageProps) {
    const styles = useThemeStyles();
    const {reset, submit} = useSearchFilters();

    const handleBackButtonPress = () => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    return (
        <ScreenWrapper
            testID={`${SearchFiltersBasePage.displayName}-${key}`}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.flex1]}>
                {children}
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    resetChanges={reset}
                    applyChanges={submit}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFiltersBasePage.displayName = 'SearchFiltersBasePage';

export default SearchFiltersBasePage;
export type {SearchFiltersBasePageProps};
