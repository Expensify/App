import React, {useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import RenderHTML from '@components/RenderHTML';
import { View } from 'react-native-web';

function DomainPermissionInfoPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={DomainPermissionInfoPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('travel.domainPermissionInfo.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>
            <RenderHTML 
                html={translate('travel.domainPermissionInfo.restriction', {domain: 'domain.com'})}
            />
            </View>
        </ScreenWrapper>
    );
}

DomainPermissionInfoPage.displayName = 'DomainPermissionInfoPage';

export default DomainPermissionInfoPage;
