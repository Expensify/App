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

type notificationType = 'fallback-authentication-successful' | 'authentication-successful' | 'authentication-failed' | 'transaction-approved' | 'transaction-denied' | 'you-ran-out-of-time' | 'couldnt-send-magic-code' | 'couldnt-send-sms-code';

function multiFactorAuthenticationNotificationPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    // /**
    //  * Return a different title based on the notification type
    //  */
    // const notificationTitle = () => {

    // };

    // /**
    //  * Return a different content based on the notification type
    //  */
    // const notificationContent = () => {

    // };
 
    // /**
    //  * Return a different illustration based on the notification type
    //  */
    // const notificationIllustration = () => {

    // };

    return (
        <ScreenWrapper testID={multiFactorAuthenticationNotificationPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.notifications.successfulAuthenticationTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <BlockingView
                    icon={Illustrations.OpenPadlock}
                    contentFitImage="fill"
                    iconWidth = {140}
                    iconHeight = {140}
                    title={translate('multiFactorAuthentication.notifications.successfulAuthenticationTitle')}
                    subtitle={translate('multiFactorAuthentication.notifications.successfulAuthenticationContent')}
                    subtitleStyle={styles.textSupporting}
                    testID={multiFactorAuthenticationNotificationPage.displayName}
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

multiFactorAuthenticationNotificationPage.displayName = 'multiFactorAuthenticationNotificationPage';

export default multiFactorAuthenticationNotificationPage;

export type {notificationType};