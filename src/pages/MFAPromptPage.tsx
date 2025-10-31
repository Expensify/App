import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from './ErrorPage/NotFoundPage';

type PromptType = 'enable-biometrics' | 'enable-passkey';

type MultiFactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.PROMPT>;

type PromptcontentData =
    | {
          animation: DotLottieAnimation;
          title: TranslationPaths;
          subtitle: TranslationPaths;
      }
    | undefined;

const getPromptContentData = (promptType: PromptType): PromptcontentData => {
    switch (promptType) {
        case 'enable-biometrics':
            return {
                animation: LottieAnimations.Fingerprint,
                title: 'multiFactorAuthentication.prompts.enableBiometricsPromptTitle',
                subtitle: 'multiFactorAuthentication.prompts.enableBiometricsPromptContent',
            };
        case 'enable-passkey':
            return {
                animation: LottieAnimations.Fingerprint,
                title: 'multiFactorAuthentication.prompts.enablePasskeyPromptTitle',
                subtitle: 'multiFactorAuthentication.prompts.enablePasskeyPromptContent',
            };
        default:
            return undefined;
    }
};

function MultiFactorAuthenticationPromptPage({route}: MultiFactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    const contentData = getPromptContentData(route.params.promptType);

    if (!contentData) {
        return <NotFoundPage />;
    }

    const onConfirm = () => {
        Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_AUTHENTICATOR);
    };

    return (
        <ScreenWrapper testID={MultiFactorAuthenticationPromptPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <BlockingView
                        animation={contentData.animation}
                        animationStyles={styles.emptyLHNAnimation}
                        animationWebStyle={styles.emptyLHNAnimation}
                        title={translate(contentData.title)}
                        subtitle={translate(contentData.subtitle)}
                        subtitleStyle={styles.textSupporting}
                        containerStyle={styles.p0}
                        testID={MultiFactorAuthenticationPromptPage.displayName}
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
                        onPress={onConfirm}
                        text={translate('common.buttonConfirm')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultiFactorAuthenticationPromptPage.displayName = 'MultiFactorAuthenticationPromptPage';

export default MultiFactorAuthenticationPromptPage;

export type {PromptType};
