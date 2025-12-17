import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type DomainPermissionInfoPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO>;

function DomainPermissionInfoPage({route}: DomainPermissionInfoPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="DomainPermissionInfoPage"
        >
            <HeaderWithBackButton title={translate('travel.domainPermissionInfo.title')} />
            <View style={[styles.flex1]}>
                <View style={[styles.renderHTML, styles.flexRow, styles.mt3, styles.mr5, styles.ml5]}>
                    <RenderHTML html={translate('travel.domainPermissionInfo.restriction', route.params.domain)} />
                </View>
                <View style={[styles.renderHTML, styles.flexRow, styles.mt3, styles.mr5, styles.ml5]}>
                    <RenderHTML html={translate('travel.domainPermissionInfo.accountantInvitation')} />
                </View>
            </View>
            <FixedFooter>
                <Button
                    success
                    large
                    style={[styles.w100]}
                    onPress={() => Navigation.closeRHPFlow()}
                    text={translate('common.buttonConfirm')}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default DomainPermissionInfoPage;
