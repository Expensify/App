import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {MULTIFACTOR_AUTHENTICATION_OUTCOME_MAP} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AuthTypeName, MarqetaAuthTypeName} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

const MARQETA_TO_AUTH_TYPE_NAME: Partial<Record<MarqetaAuthTypeName, AuthTypeName>> = {
    BIOMETRIC_FACE: 'FaceID',
    BIOMETRIC_FINGERPRINT: 'Biometrics',
    KNOWLEDGE_BASED: 'Credentials',
};

type MultifactorAuthenticationOutcomePageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME>;

function MultifactorAuthenticationOutcomePage({route}: MultifactorAuthenticationOutcomePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {state} = useMultifactorAuthenticationState();
    const onGoBackPress = () => {
        Navigation.dismissModal();
    };

    const data = MULTIFACTOR_AUTHENTICATION_OUTCOME_MAP[route.params.outcomeType];

    const {asset: icon} = useMemoizedLazyAsset(() => loadIllustration(data?.illustration ?? 'HumptyDumpty'));

    // Get text values from outcome config and translate them
    const headerTitle = translate(data.headerTitle);
    const title = translate(data.title);
    const authType = (state.authenticationMethod && MARQETA_TO_AUTH_TYPE_NAME[state.authenticationMethod]) ?? 'Unknown';
    // @ts-expect-error data.description type is TranslationPaths which doesn't narrow to specific param types
    const description = translate(data.description, {authType, registered: false});

    const CustomDescription = data?.customDescription;
    const CustomSubtitle = CustomDescription ? <CustomDescription /> : undefined;

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
                    iconWidth={data?.iconWidth}
                    iconHeight={data?.iconHeight}
                    title={title}
                    titleStyles={styles.mb2}
                    subtitle={description}
                    CustomSubtitle={CustomSubtitle}
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
