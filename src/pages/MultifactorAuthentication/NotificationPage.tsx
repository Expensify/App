import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';

const mockedConfigSuccess = {
    headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
    title: 'multifactorAuthentication.biometricsTest.authenticationSuccessful',
    description: 'multifactorAuthentication.biometricsTest.successfullyAuthenticatedUsing',
} as const satisfies Record<string, TranslationPaths>;

const mockedConfigFailure = {
    headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
    title: 'multifactorAuthentication.oops',
    description: 'multifactorAuthentication.biometricsTest.yourAttemptWasUnsuccessful',
} as const satisfies Record<string, TranslationPaths>;

type MultifactorAuthenticationNotificationPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.NOTIFICATION>;

function MultifactorAuthenticationNotificationPage({route}: MultifactorAuthenticationNotificationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => {
        Navigation.dismissModal();
    };

    const isSuccessNotification = route.params.notificationType === 'success';

    let headerTitle = translate(mockedConfigFailure.headerTitle);
    let title = translate(mockedConfigFailure.title);
    let description = translate(mockedConfigFailure.description);

    if (isSuccessNotification) {
        headerTitle = translate(mockedConfigSuccess.headerTitle);
        title = translate(mockedConfigSuccess.title);
        description = translate(mockedConfigSuccess.description, {authType: 'FaceID'});
    }

    const {asset: icon} = useMemoizedLazyAsset(() => loadIllustration(isSuccessNotification ? 'OpenPadlock' : 'HumptyDumpty'));

    return (
        <ScreenWrapper testID={MultifactorAuthenticationNotificationPage.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={styles.flex1}>
                <BlockingView
                    icon={icon}
                    contentFitImage="fill"
                    iconWidth={isSuccessNotification ? variables.openPadlockWidth : variables.humptyDumptyWidth}
                    iconHeight={isSuccessNotification ? variables.openPadlockHeight : variables.humptyDumptyHeight}
                    title={title}
                    titleStyles={styles.mb2}
                    subtitle={description}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={styles.ph5}
                    testID={MultifactorAuthenticationNotificationPage.displayName}
                />
            </View>
            <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                <Button
                    success
                    style={styles.flex1}
                    onPress={onGoBackPress}
                    text={translate('common.buttonConfirm')}
                />
            </View>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationNotificationPage.displayName = 'MultifactorAuthenticationNotificationPage';

export default MultifactorAuthenticationNotificationPage;
