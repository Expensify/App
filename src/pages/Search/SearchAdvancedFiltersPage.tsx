import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text, View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type SearchPageProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

// Todo finish this page, fix route params and add Form provider
function SearchAdvancedFiltersPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // add advanced filters

    return (
        <ScreenWrapper
            testID={SearchAdvancedFiltersPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('search.filtersHeader')} />
                <View style={[styles.flex1]}>
                    <Text>Search advanced filters</Text>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchAdvancedFiltersPage.displayName = 'SearchAdvancedFiltersPage';

export default SearchAdvancedFiltersPage;
