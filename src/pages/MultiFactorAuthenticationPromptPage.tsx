import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Text from '@components/Text';
import Button from '@components/Button';
import BlockingView from '@components/BlockingViews/BlockingView';
import LottieAnimations from '@components/LottieAnimations';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import { MultiFactorAuthenticationParamList } from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import { TranslationPaths } from '@src/languages/types';
import NotFoundPage from './ErrorPage/NotFoundPage';

type promptType = 'enable-biometrics' | 'enable-passkey';

type multiFactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.PROMPT>;

type PromptData = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
} | undefined;

const getPromptData = (promptType: promptType) : PromptData => {
    switch (promptType) {
        case 'enable-biometrics':
            return {
                animation: LottieAnimations.Fingerprint,
                title: "multiFactorAuthentication.prompts.enableBiometricsPromptTitle",
                subtitle: "multiFactorAuthentication.prompts.enableBiometricsPromptContent",
            };
        case 'enable-passkey':
            return {
                animation: LottieAnimations.Fingerprint,
                title: "multiFactorAuthentication.prompts.enablePasskeyPromptTitle",
                subtitle: "multiFactorAuthentication.prompts.enablePasskeyPromptContent",
            };
        default:
            return undefined;
    }
};

function multiFactorAuthenticationPromptPage({route}: multiFactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    const data = getPromptData(route.params.promptType);

    if (!data) {
        return <NotFoundPage/>
    }

    const onConfirm = () => {
        onGoBackPress();
    };

    return (
        <ScreenWrapper testID={multiFactorAuthenticationPromptPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <BlockingView
                        animation={data.animation}
                        animationStyles={styles.emptyLHNAnimation}
                        animationWebStyle={styles.emptyLHNAnimation}
                        title={translate(data.title)}
                        subtitle={translate(data.subtitle)}
                        subtitleStyle={styles.textSupporting}
                        containerStyle={styles.p0}
                        testID={multiFactorAuthenticationPromptPage.displayName}
                    />
                </View>
                <View style={[styles.flexColumn, styles.gap3, styles.m5]}>
                    <Button
                        style={[styles.flex1]}
                        onPress={onGoBackPress}
                        text={translate('common.notNow')}
                    />
                    <Button
                        success
                        style={[styles.flex1]}
                        onPress={onGoBackPress}
                        text={translate('common.buttonConfirm')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

multiFactorAuthenticationPromptPage.displayName = 'MultiFactorAuthenticationPromptPage';

export default multiFactorAuthenticationPromptPage;

export type {promptType};