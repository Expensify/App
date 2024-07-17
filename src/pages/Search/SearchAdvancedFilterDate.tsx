import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@src/components/Text';

function SearchAdvancedFilterDate() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            testID={SearchAdvancedFilterDate.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('search.filters.date.header')} />
                <View style={[styles.flex1]}>
                    <Text>Here will be search advanced filter: Date</Text>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchAdvancedFilterDate.displayName = 'SearchAdvancedFilterDate';

export default SearchAdvancedFilterDate;
