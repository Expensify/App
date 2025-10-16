import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

type notificationType = 'authentication-successful' | 'authentication-failed' | 'transaction-approved' | 'transaction-denied' | 'you-ran-out-of-time' | 'couldnt-send-magic-code' | 'couldnt-send-sms-code';

function BiometricsNotificationsPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.goBack();

    

    return (
        <ScreenWrapper testID={BiometricsNotificationsPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <BlockingView
                    icon={Illustrations.OpenPadlock}
                    contentFitImage="fill"
                    title={translate('multiFactorAuthentication.biometrics.notificationTitle')}
                    subtitle={translate('multiFactorAuthentication.biometrics.notificationFallbackContent')}
                    subtitleStyle={styles.textSupporting}
                    testID={BiometricsNotificationsPage.displayName}
                />
            </View>
            <View style={[styles.flexRow, styles.m5]}>
                <Button
                    success
                    style={[styles.flex1]}
                    onPress={onGoBackPress}
                    text={translate('common.buttonConfirm')}
                />
            </View>
        </ScreenWrapper>
    );
}

BiometricsNotificationsPage.displayName = 'BiometricsNotificationsPage';

export default BiometricsNotificationsPage;

export type {notificationType};