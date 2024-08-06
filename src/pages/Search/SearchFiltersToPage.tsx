import React from 'react';
import {View} from 'react-native';
// import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

// import ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.to')} />
                <View style={[styles.flex1]} />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersStatusPage.displayName = 'SearchFiltersStatusPage';

export default SearchFiltersStatusPage;
