import React, {useCallback, useMemo, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationPromptActions from '@components/MultifactorAuthentication/PromptActions';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthentication/scenarios';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
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
        trigger(CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE);
    }, [isConfirmModalVisible, trigger, hideConfirmModal]);

    if (!contentData) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={MultifactorAuthenticationPromptPage.displayName}>
            {/* TODO: MFA/Dev Change the behavior of back button */}
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.biometrics.additionalFactorPageTitle')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MultifactorAuthenticationPromptContent
                    // animation={contentData.animation}
                    title={contentData.title}
                    subtitle={contentData.subtitle}
                />
                <MultifactorAuthenticationPromptActions
                    onGoBackPress={onGoBackPress}
                    onConfirm={onConfirm}
                />
                <MultifactorAuthenticationTriggerCancelConfirmModal
                    isVisible={isConfirmModalVisible}
                    onConfirm={denyTransaction}
                    onCancel={hideConfirmModal}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
