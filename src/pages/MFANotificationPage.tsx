import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from './ErrorPage/NotFoundPage';

// TODO: remove, as this will be actually defined inside the SCENARIOS file but will still be a simple string - we will have to adjust the URLs to something more general like success and failure simply to have matching URLs (or simply /notification)
type NotificationType = 'authentication-successful' | 'authentication-failed' | 'transaction-approved' | 'transaction-denied' | 'you-ran-out-of-time';

type MultiFactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.NOTIFICATION>;

// TODO: remove, as this data will actually come from the SCENARIOS file
type NotificationData =
    | {
          illustration: React.FC<SvgProps>;
          iconWidth: number;
          iconHeight: number;
          padding: ViewStyle;
      }
    | undefined;

// TODO: remove, as this data will actually come from the SCENARIOS file
const getNotificationData = (notificationType: NotificationType, styles: ThemeStyles): NotificationData => {
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
function MFANotificationPage({route}: MultiFactorAuthenticationNotificationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    // TODO: replace with notification which gets the actual data from SCENARIO file
    const data = getNotificationData(route.params.notificationType, styles);

    // data2  // TODO: replace with the correct data from MFAcontext
    const {headerTitle, title, content} = {headerTitle: 'headerTitle', title: 'Title', content: 'Content'};

    if (!data) {
        return <NotFoundPage />;
    }

    return (
        // No FullPageOfflineBlockingView here as there is no more cominication through network at this point
        <ScreenWrapper testID={MFANotificationPage.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <BlockingView
                    icon={data.illustration}
                    contentFitImage="fill"
                    iconWidth={data.iconWidth}
                    iconHeight={data.iconHeight}
                    title={title}
                    subtitle={content}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={styles.p1} // "sometimes maybe good sometimes maybe bad" - we have to decide on one padding for all those screens
                    testID={MFANotificationPage.displayName}
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

MFANotificationPage.displayName = 'multiFactorAuthenticationNotificationPage';

export default MFANotificationPage;

export type {NotificationType};
