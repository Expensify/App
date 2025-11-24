import React, {useCallback, useMemo, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MFAPromptActions from '@components/MultiFactorAuthentication/MFAPromptActions';
import MFAPromptContent from '@components/MultiFactorAuthentication/MFAPromptContent';
import MFATriggerCancelConfirmModal from '@components/MultiFactorAuthentication/MFATriggerCancelConfirmModal';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthenticationContext/ui';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type MultiFactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.PROMPT>;

function MultiFactorAuthenticationPromptPage({route}: MultiFactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const {update, trigger} = useMultifactorAuthenticationContext();

    const contentData = useMemo(() => MULTIFACTOR_AUTHENTICATION_PROMPT_UI[route.params.promptType], [route.params.promptType]);

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
        trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.FAILURE);
        // MFAdenyTransaction(); // TODO: Create a trigger responsible for failure
        // onGoBackPress();
    }, [isConfirmModalVisible, trigger, hideConfirmModal]);

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
                <MFATriggerCancelConfirmModal
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
