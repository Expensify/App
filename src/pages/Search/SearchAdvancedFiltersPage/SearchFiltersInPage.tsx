import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFiltersChatsSelector from '@components/Search/SearchFiltersChatsSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersInPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isScreenTransitionEnd, setIsScreenTransitionEnd] = useState(false);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const handleScreenTransitionEnd = () => {
        setIsScreenTransitionEnd(true);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersInPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            onEntryTransitionEnd={handleScreenTransitionEnd}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.in')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchFiltersChatsSelector
                    isScreenTransitionEnd={isScreenTransitionEnd}
                    onFiltersUpdate={(selectedAccountIDs) => {
                        SearchActions.updateAdvancedFilters({
                            in: selectedAccountIDs,
                        });
                    }}
                    initialReportIDs={searchAdvancedFiltersForm?.in ?? []}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersInPage.displayName = 'SearchFiltersInPage';

export default SearchFiltersInPage;
