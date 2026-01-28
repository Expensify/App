import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFiltersParticipantsSelector from '@components/Search/SearchFiltersParticipantsSelector';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {updateAdvancedFilters} from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersAttendeePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    return (
        <ScreenWrapper
            testID="SearchFiltersAttendeePage"
            includeSafeAreaPaddingBottom
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.attendees')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SearchFiltersParticipantsSelector
                    initialAccountIDs={searchAdvancedFiltersForm?.attendee ?? []}
                    onFiltersUpdate={(selectedAccountIDs) => {
                        updateAdvancedFilters({
                            attendee: selectedAccountIDs,
                        });
                    }}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersAttendeePage;
