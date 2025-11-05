import React, {useCallback, useMemo} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import MFAPromptActions from '@components/MFA/MFAPromptActions';
import MFAPromptContent from '@components/MFA/MFAPromptContent';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from './ErrorPage/NotFoundPage';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';

type PromptType = 'enable-biometrics' | 'enable-passkey';

type MultiFactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.PROMPT>;

type PromptContentData =
    | {
          animation: DotLottieAnimation;
          title: TranslationPaths;
          subtitle: TranslationPaths;
      }
    | undefined;

const getPromptContentData = (promptType: PromptType): PromptContentData => {
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
    const {update} = useMultifactorAuthenticationContext();

    // Memoize to avoid recalculating on every render
    const contentData = useMemo(() => getPromptContentData(route.params.promptType), [route.params.promptType]);

    const onConfirm = useCallback(() => {
        update({softPromptDecision: true});
    }, [update]);

    const onGoBackPress = useCallback(() => {
        update({softPromptDecision: false});
    }, [update]);


    if (!contentData) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={MultiFactorAuthenticationPromptPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MFAPromptContent
                    animation={contentData.animation}
                    title={contentData.title}
                    subtitle={contentData.subtitle}
                />
                <MFAPromptActions
                    onGoBackPress={onGoBackPress}
                    onConfirm={onConfirm}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultiFactorAuthenticationPromptPage.displayName = 'MultiFactorAuthenticationPromptPage';

export default MultiFactorAuthenticationPromptPage;

export type {PromptType};
