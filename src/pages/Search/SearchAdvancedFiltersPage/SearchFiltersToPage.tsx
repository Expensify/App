import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFiltersParticipantsSelector from '@components/Search/SearchFiltersParticipantsSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersToPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    return (
        <ScreenWrapper
            testID={SearchFiltersToPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.to')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchFiltersParticipantsSelector
                    initialAccountIDs={searchAdvancedFiltersForm?.to ?? []}
                    onFiltersUpdate={(selectedAccountIDs) => {
                        SearchActions.updateAdvancedFilters({
                            to: selectedAccountIDs,
                        });
                    }}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersToPage.displayName = 'SearchFiltersToPage';

export default SearchFiltersToPage;
