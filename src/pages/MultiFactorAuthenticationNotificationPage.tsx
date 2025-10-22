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

// TODO: remove, as this will be actually defined inside the SCENARIOS file but will still be a simple string 
type notificationType = 'authentication-successful' | 'authentication-failed' | 'registration-failed' | 'transaction-approved' | 'transaction-denied' | 'you-ran-out-of-time' | 'couldnt-send-magic-code' | 'couldnt-send-sms-code';

type MultiFactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.NOTIFICATION>;

// TODO: remove, as this data will actually come from the SCENARIOS file
type NotificationData = {
    illustration: React.FC<SvgProps>;
    iconWidth: number;
    iconHeight: number;
    padding: ViewStyle;
} | undefined;

// TODO: remove, as this data will actually come from the SCENARIOS file
const getNotificationData = (notificationType: string): NotificationData => {
    const styles = useThemeStyles();
    switch (notificationType) {
        case 'authentication-successful':
            return {
                illustration: Illustrations.OpenPadlock,
                iconWidth: variables.openPadlockWidth,
                iconHeight: variables.openPadlockHeight,
                padding: styles.p2,
            };
        case 'authentication-failed':
            return {
                illustration: Illustrations.HumptyDumpty,
                iconWidth: variables.humptyDumptyWidth,
                iconHeight: variables.humptyDumptyHeight,
                padding: styles.p0,
            };
        case 'transaction-approved':
            return {
                illustration: Illustrations.ApprovedTransactionHand,
                iconWidth: variables.transactionHandWidth,
                iconHeight: variables.transactionHandHeight,
                padding: styles.p0,
            };
        case 'transaction-denied':
            return {
                illustration: Illustrations.DeniedTransactionHand,
                iconWidth: variables.transactionHandWidth,
                iconHeight: variables.transactionHandHeight,
                padding: styles.p0,
            };
        case 'you-ran-out-of-time':
            return {
                illustration: Illustrations.RunOutOfTime,
                iconWidth: variables.runOutOfTimeWidth,
                iconHeight: variables.runOutOfTimeHeight,
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

    // TODO: replace with notification which gets the actual data from SCENARIO file
    const data = getNotificationData(route.params.notificationType);

    // data2  // TODO: replace with the correct data from MFAcontext
    const {headerTitle, title, content} = {headerTitle: "headerTitle", title: "Title", content: "Content"};

    if (!data) {
        return <NotFoundPage/>;
    }
    
    return (
        <ScreenWrapper testID={multiFactorAuthenticationNotificationPage.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <BlockingView
                    icon={data.illustration}
                    contentFitImage="fill"
                    iconWidth = {data.iconWidth}
                    iconHeight = {data.iconHeight}
                    title={title}
                    subtitle={content}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={styles.p1} // "sometimes maybe good sometimes maybe bad" - we can either decide on one padding for all those screens or get that from MFAcontext
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