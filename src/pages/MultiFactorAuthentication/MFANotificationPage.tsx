import React, {useCallback, useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

// TODO: dodac co configa scenario: success i failure screen i tam zdefiniowac to nizej a runoutoftime do constow
type NotificationType = 'authentication-successful' | 'authentication-failed' | 'transaction-approved' | 'transaction-denied' | 'you-ran-out-of-time';

type MultiFactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.NOTIFICATION>;
type NotificationData =
    | {
          illustration: React.FC<SvgProps>;
          iconWidth: number;
          iconHeight: number;
          padding: ViewStyle;
      }
    | undefined;

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
    const onGoBackPress = useCallback(() => {
        Navigation.dismissModal();
    }, []);

    const {info} = useMultifactorAuthenticationContext();

    // TODO: jak wyzej
    const data = useMemo(() => getNotificationData(route.params.notificationType, styles), [route.params.notificationType, styles]);

    const {headerTitle, title, content} = {headerTitle: info.title, title: info.title, content: info.message};

    if (!data) {
        return <NotFoundPage />;
    }

    return (
        // No FullPageOfflineBlockingView here as there is no more communication through network at this point
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
