import React, {useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

const mockedConfig = {
    title: 'multifactorAuthentication.verifyYourself.biometrics',
    subtitle: 'multifactorAuthentication.enableQuickVerification.biometrics',
} as const satisfies Record<string, TranslationPaths>;

function MultifactorAuthenticationPromptPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onConfirm = () => {
        // Temporary navigation, expected behavior: let the MultifactorAuthentication know that the soft prompt was accepted
        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_NOTIFICATION.getRoute(CONST.MULTIFACTOR_AUTHENTICATION_NOTIFICATION_TYPE.SUCCESS));
    };

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const cancelFlow = () => {
        if (!isConfirmModalVisible) {
            return;
        }

        hideConfirmModal();
        // Temporary navigation, expected behavior: trigger the failure from the MultifactorAuthenticationContext
        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_NOTIFICATION.getRoute(CONST.MULTIFACTOR_AUTHENTICATION_NOTIFICATION_TYPE.FAILURE));
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
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.letsVerifyItsYou')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MultifactorAuthenticationPromptContent
                    animation={LottieAnimations.Fingerprint}
                    title={mockedConfig.title}
                    subtitle={mockedConfig.subtitle}
                />
                <FixedFooter style={[styles.flexColumn, styles.gap3]}>
                    <Button
                        success
                        onPress={onConfirm}
                        text={translate('common.buttonConfirm')}
                    />
                </FixedFooter>
                <MultifactorAuthenticationTriggerCancelConfirmModal
                    isVisible={isConfirmModalVisible}
                    onConfirm={cancelFlow}
                    onCancel={hideConfirmModal}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
