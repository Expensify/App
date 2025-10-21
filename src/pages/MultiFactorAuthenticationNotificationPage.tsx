import React from 'react';
import {View, ViewStyle} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import { MultiFactorAuthenticationParamList } from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import { SvgProps } from 'react-native-svg';
import { TranslationPaths } from '@src/languages/types';
import NotFoundPage from './ErrorPage/NotFoundPage';
import variables from '@styles/variables';
import styles from '@styles/index';

type notificationType = 'fallback-authentication-successful' | 'authentication-successful' | 'authentication-failed' | 'registration-failed' | 'transaction-approved' | 'transaction-denied' | 'you-ran-out-of-time' | 'couldnt-send-magic-code' | 'couldnt-send-sms-code';

type MultiFactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.NOTIFICATION>;

type NotificationData = {
    headerTitle?: TranslationPaths;
    title: TranslationPaths;
    content: TranslationPaths;
    illustration: React.FC<SvgProps>;
    iconWidth: number;
    iconHeight: number;
    padding: ViewStyle;
} | undefined;

const getNotificationData = (notificationType: string): NotificationData => {
    const styles = useThemeStyles();
    switch (notificationType) {
        case 'fallback-authentication-successful':
            return {
                title: 'multiFactorAuthentication.notifications.successfulAuthenticationTitle',
                content: 'multiFactorAuthentication.notifications.successfulFallbackAuthenticationContent',
                illustration: Illustrations.OpenPadlock,
                iconWidth: variables.openPadlockWidth,
                iconHeight: variables.openPadlockHeight,
                padding: styles.p2,
            };
        case 'authentication-successful':
            return {
                title: 'multiFactorAuthentication.notifications.successfulAuthenticationTitle',
                content: 'multiFactorAuthentication.notifications.successfulAuthenticationContent',
                illustration: Illustrations.OpenPadlock,
                iconWidth: variables.openPadlockWidth,
                iconHeight: variables.openPadlockHeight,
                padding: styles.p2,
            };
        case 'authentication-failed':
            return {
                headerTitle: 'multiFactorAuthentication.notifications.failedAuthenticationHeaderTitle',
                title: 'multiFactorAuthentication.notifications.failedAuthenticationTitle',
                content: 'multiFactorAuthentication.notifications.failedAuthenticationContent',
                illustration: Illustrations.HumptyDumpty,
                iconWidth: variables.humptyDumptyWidth,
                iconHeight: variables.humptyDumptyHeight,
                padding: styles.p0,
            };
        case 'registration-failed':
            return {
                headerTitle: 'multiFactorAuthentication.notifications.failedAuthenticationHeaderTitle',
                title: 'multiFactorAuthentication.notifications.failedAuthenticationTitle',
                content: 'multiFactorAuthentication.notifications.failedRegistrationContent',
                illustration: Illustrations.HumptyDumpty,
                iconWidth: variables.humptyDumptyWidth,
                iconHeight: variables.humptyDumptyHeight,
                padding: styles.p0,
            };
        case 'transaction-approved':
            return {
                headerTitle: 'multiFactorAuthentication.notifications.approvedTransactionHeaderTitle',
                title: 'multiFactorAuthentication.notifications.approvedTransactionTitle',
                content: 'multiFactorAuthentication.notifications.approvedTransactionContent',
                illustration: Illustrations.ApprovedTransactionHand,
                iconWidth: variables.transactionHandWidth,
                iconHeight: variables.transactionHandHeight,
                padding: styles.p0,
            };
        case 'transaction-denied':
            return {
                title: 'multiFactorAuthentication.notifications.deniedTransactionTitle',
                content: 'multiFactorAuthentication.notifications.deniedTransactionContent',
                illustration: Illustrations.DeniedTransactionHand,
                iconWidth: variables.transactionHandWidth,
                iconHeight: variables.transactionHandHeight,
                padding: styles.p0,
            };
        case 'you-ran-out-of-time':
            return {
                headerTitle: 'multiFactorAuthentication.notifications.deniedTransactionTitle',
                title: 'multiFactorAuthentication.notifications.youRunOutOfTimeTitle',
                content: 'multiFactorAuthentication.notifications.youRunOutOfTimeContent',
                illustration: Illustrations.RunOutOfTime,
                iconWidth: variables.runOutOfTimeWidth,
                iconHeight: variables.runOutOfTimeHeight,
                padding: styles.p0,
            };
        case 'couldnt-send-magic-code':
            return {
                headerTitle: 'multiFactorAuthentication.notifications.deniedTransactionTitle',
                title: 'multiFactorAuthentication.notifications.couldntSendMagicCodeTitle',
                content: 'multiFactorAuthentication.notifications.couldntSendMagicCodeContent',
                illustration: Illustrations.HumptyDumpty,
                iconWidth: variables.humptyDumptyWidth,
                iconHeight: variables.humptyDumptyHeight,
                padding: styles.p0,
            };
        case 'couldnt-send-sms-code':
            return {
                headerTitle: 'multiFactorAuthentication.notifications.deniedTransactionTitle',
                title: 'multiFactorAuthentication.notifications.couldntSendSMSCodeTitle',
                content: 'multiFactorAuthentication.notifications.couldntSendSMSCodeContent',
                illustration: Illustrations.HumptyDumpty,
                iconWidth: variables.humptyDumptyWidth,
                iconHeight: variables.humptyDumptyHeight,
                padding: styles.p0,
            };
        default:
            return undefined;
    }
};
function multiFactorAuthenticationNotificationPage({route}: MultiFactorAuthenticationNotificationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    const data = getNotificationData(route.params.notificationType);

    if (!data) {
        return <NotFoundPage/>;
    }
    
    return (
        <ScreenWrapper testID={multiFactorAuthenticationNotificationPage.displayName}>
            <HeaderWithBackButton
                title={translate(data.headerTitle ? data.headerTitle : data.title)}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <BlockingView
                    icon={data.illustration}
                    contentFitImage="fill"
                    iconWidth = {data.iconWidth}
                    iconHeight = {data.iconHeight}
                    title={translate(data.title)}
                    subtitle={translate(data.content)}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={data.padding}
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