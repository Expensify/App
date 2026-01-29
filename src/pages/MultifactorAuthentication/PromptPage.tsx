import React, {useState} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthentication, useMultifactorAuthenticationGuards, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {cancel} = useMultifactorAuthentication();
    const {state, setSoftPromptApproved} = useMultifactorAuthenticationState();
    const {guards} = useMultifactorAuthenticationGuards();

    const contentData = MULTIFACTOR_AUTHENTICATION_PROMPT_UI[route.params.promptType];

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onConfirm = () => {
        setSoftPromptApproved(true);
    };

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const cancelFlow = () => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        cancel();
    };

    const focusTrapConfirmModal = () => {
        setConfirmModalVisibility(true);
        return false;
    };

    return (
        <ScreenWrapper
            testID={MultifactorAuthenticationPromptPage.displayName}
            focusTrapSettings={{
                focusTrapOptions: {
                    allowOutsideClick: focusTrapConfirmModal,
                    clickOutsideDeactivates: focusTrapConfirmModal,
                    escapeDeactivates: focusTrapConfirmModal,
                },
            }}
        >
            <FullPageNotFoundView shouldShow={!guards.canAccessPrompt || !contentData}>
                <HeaderWithBackButton
                    title={translate('multifactorAuthentication.letsVerifyItsYou')}
                    onBackButtonPress={showConfirmModal}
                    shouldShowBackButton
                />
                <FullPageOfflineBlockingView>
                    <MultifactorAuthenticationPromptContent
                        animation={contentData?.animation}
                        title={contentData?.title}
                        subtitle={contentData?.subtitle}
                    />
                    <FixedFooter style={[styles.flexColumn, styles.gap3]}>
                        <Button
                            success
                            onPress={onConfirm}
                            text={translate('common.buttonConfirm')}
                        />
                    </FixedFooter>
                    <MultifactorAuthenticationTriggerCancelConfirmModal
                        scenario={state.scenario}
                        isVisible={isConfirmModalVisible}
                        onConfirm={cancelFlow}
                        onCancel={hideConfirmModal}
                    />
                </FullPageOfflineBlockingView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
