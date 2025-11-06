import React, {useCallback, useMemo, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import MFADenyTransactionConfirmModal from '@components/MultiFactorAuthentication/MFADenyTransactionConfirmModal';
import MFAPromptActions from '@components/MultiFactorAuthentication/MFAPromptActions';
import MFAPromptContent from '@components/MultiFactorAuthentication/MFAPromptContent';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';

// TODO: to tez gdzies do UI config?
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

    const contentData = useMemo(() => getPromptContentData(route.params.promptType), [route.params.promptType]);

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onConfirm = useCallback(() => {
        update({softPromptDecision: true});
    }, [update]);

    const onGoBackPress = useCallback(() => {
        update({softPromptDecision: false});
    }, [update]);

    const showConfirmModal = useCallback(() => {
        setConfirmModalVisibility(true);
    }, []);

    const hideConfirmModal = useCallback(() => {
        setConfirmModalVisibility(false);
    }, []);

    const denyTransaction = useCallback(() => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        // MFAdenyTransaction(); // TODO: trigger(cancel) do transaction denied page
        onGoBackPress();
    }, [isConfirmModalVisible, hideConfirmModal, onGoBackPress]);

    if (!contentData) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={MultiFactorAuthenticationPromptPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MFAPromptContent
                    // animation={contentData.animation}
                    title={contentData.title}
                    subtitle={contentData.subtitle}
                />
                <MFAPromptActions
                    onGoBackPress={onGoBackPress}
                    onConfirm={onConfirm}
                />
                <MFADenyTransactionConfirmModal
                    isVisible={isConfirmModalVisible}
                    onConfirm={denyTransaction}
                    onCancel={hideConfirmModal}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultiFactorAuthenticationPromptPage.displayName = 'MultiFactorAuthenticationPromptPage';

export default MultiFactorAuthenticationPromptPage;

export type {PromptType};
