import React from 'react';
import {View} from 'react-native-web';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function PublicDomainErrorPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={PublicDomainErrorPage.displayName}
        >
            <HeaderWithBackButton onBackButtonPress={() => Navigation.goBack()} />
            <View style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>
                <Text style={styles.headerAnonymousFooter}>{`${translate('travel.publicDomainError.title')}`}</Text>
                <br />
                <Text>{translate('travel.publicDomainError.message')}</Text>
            </View>
        </ScreenWrapper>
    );
}

PublicDomainErrorPage.displayName = 'PublicDomainErrorPage';

export default PublicDomainErrorPage;
