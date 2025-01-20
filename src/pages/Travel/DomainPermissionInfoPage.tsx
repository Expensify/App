import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native-web';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {TravelNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

type DomainPermissionInfoPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO>;

function DomainPermissionInfoPage({route}: DomainPermissionInfoPageProps) {
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
            <View style={[styles.flex1]}>
                <View style={[styles.mt3, styles.mr5, styles.ml5]}>
                    <RenderHTML html={translate('travel.domainPermissionInfo.restriction', {domain: route.params.domain})} />
                </View>
                <View style={[styles.mt3, styles.mr5, styles.mb5, styles.ml5]}>
                    <RenderHTML html={translate('travel.domainPermissionInfo.accountantInvitation')} />
                </View>
            </View>
            <FixedFooter>
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={() => Navigation.goBack()}
                    text={translate('common.buttonConfirm')}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

DomainPermissionInfoPage.displayName = 'DomainPermissionInfoPage';

export default DomainPermissionInfoPage;
