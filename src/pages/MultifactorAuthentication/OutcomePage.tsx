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
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';

// TODO: this config will be part of the scenario configuration, the current implementation is for testing purposes (https://github.com/Expensify/App/issues/79373)
const mockedConfigSuccess = {
    headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
    title: 'multifactorAuthentication.biometricsTest.authenticationSuccessful',
    description: 'multifactorAuthentication.biometricsTest.successfullyAuthenticatedUsing',
} as const satisfies Record<string, TranslationPaths>;

// TODO: this config will be part of the scenario configuration, the current implementation is for testing purposes (https://github.com/Expensify/App/issues/79373)
const mockedConfigFailure = {
    headerTitle: 'multifactorAuthentication.biometricsTest.biometricsTest',
    title: 'multifactorAuthentication.oops',
    description: 'multifactorAuthentication.biometricsTest.yourAttemptWasUnsuccessful',
} as const satisfies Record<string, TranslationPaths>;

type MultifactorAuthenticationOutcomePageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME>;

function MultifactorAuthenticationOutcomePage({route}: MultifactorAuthenticationOutcomePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => {
        Navigation.dismissModal();
    };

    const isSuccessOutcome = route.params.outcomeType === CONST.MULTIFACTOR_AUTHENTICATION_OUTCOME_TYPE.SUCCESS;

    let headerTitle = translate(mockedConfigFailure.headerTitle);
    let title = translate(mockedConfigFailure.title);
    let description = translate(mockedConfigFailure.description);

    if (isSuccessOutcome) {
        headerTitle = translate(mockedConfigSuccess.headerTitle);
        title = translate(mockedConfigSuccess.title);
        // TODO: Replace hardcoded 'FaceID' with the actual authentication type (e.g., 'FaceID', 'TouchID', 'Fingerprint')
        // once the MFA context provides the auth method used. This will require adding authType to route params and to CONST.
        description = translate(mockedConfigSuccess.description, {authType: 'FaceID'});
    }

    const {asset: icon} = useMemoizedLazyAsset(() => loadIllustration(isSuccessOutcome ? 'OpenPadlock' : 'HumptyDumpty'));

    return (
        <ScreenWrapper testID={MultifactorAuthenticationOutcomePage.displayName}>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={styles.flex1}>
                <BlockingView
                    icon={icon}
                    contentFitImage="fill"
                    iconWidth={isSuccessOutcome ? variables.openPadlockWidth : variables.humptyDumptyWidth}
                    iconHeight={isSuccessOutcome ? variables.openPadlockHeight : variables.humptyDumptyHeight}
                    title={title}
                    titleStyles={styles.mb2}
                    subtitle={description}
                    subtitleStyle={styles.textSupporting}
                    containerStyle={styles.ph5}
                    testID={MultifactorAuthenticationOutcomePage.displayName}
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

MultifactorAuthenticationOutcomePage.displayName = 'MultifactorAuthenticationOutcomePage';

export default MultifactorAuthenticationOutcomePage;
