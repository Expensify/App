import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import AuthenticationSuccessfullNotification from './AuthenticationSuccessfullNotification';
import ConfirmModal from './ConfirmModal';
import * as Illustrations from './Icon/Illustrations';

type EnableBiometrcicsVerificationProps = {
    /** Soft prompt visibility */
    isVisible: boolean;

    /** A callback to call when the initial soft prompt has been closed */
    onCancel?: () => void;

    /** A callback to set biometrics as enabled (registered) */
    registerBiometrics?: () => void;
};

function EnableBiometrcicsModal({isVisible, onCancel = () => {}, registerBiometrics = () => {}}: EnableBiometrcicsVerificationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [shouldNotifyAboutSuccess, setSuccess] = useState(false);
    const [isNotificationVisible, setNotificationVisibility] = useState(false);
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();
    const action = singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.ENABLE_BIOMETRICS_ERROR_PAGE)));

    const handleClose = () => {
        onCancel();
        setSuccess(false);
        setNotificationVisibility(false);
    };

    /**
     * Change to false if you want to test error page. This should be replaced by the actual logic checking if the registration was successfull.
     */
    const wasRegistrationSuccessful = false;

    return (
        <View>
            <ConfirmModal
                title={translate('initialSettingsPage.troubleshoot.biometrics.softPromptTitle')}
                titleStyles={styles.textHeadlineLineHeightXXL}
                isVisible={isVisible}
                onConfirm={() => {
                    if (wasRegistrationSuccessful) {
                        registerBiometrics();
                        onCancel();
                        setSuccess(true);
                    } else {
                        handleClose();
                        action();
                    }
                }}
                onCancel={() => onCancel()}
                /**
                 * The `onModalHide` prop, along with one of the two states checking if the success notification should be visible, will become redundant when the biometric functionality is integrated.
                 * This is because now we have nothing between soft prompt and success notification thus one confirmation modal attempts to open while another has not fully closed yet which leads to issues.
                 *
                 * Native biometric actions/popups will prompt us to hide the soft prompt beforehand, ensuring it is fully closed before there's a need to display the success notification.
                 */
                onModalHide={() => {
                    if (!shouldNotifyAboutSuccess) {
                        return;
                    }
                    setNotificationVisibility(true);
                }}
                prompt={translate('initialSettingsPage.troubleshoot.biometrics.softPromptContent')}
                promptStyles={styles.textSupporting}
                confirmText={translate('common.continue')}
                cancelText={translate('common.notNow')}
                shouldReverseStackedButtons
                iconSource={Illustrations.SimpleSmartscan}
                iconWidth={variables.softPromptSmartscanSize}
                iconHeight={variables.softPromptSmartscanSize}
                iconFill={false}
                shouldCenterIcon
            />
            <AuthenticationSuccessfullNotification
                isVisible={isNotificationVisible}
                onConfirm={() => handleClose()}
            />
        </View>
    );
}

EnableBiometrcicsModal.displayName = 'EnableBiometricsModal';

export default EnableBiometrcicsModal;
