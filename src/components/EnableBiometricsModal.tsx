import React, {useState} from 'react';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useSingleExecution from '@hooks/useSingleExecution';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import { View } from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ConfirmModal from './ConfirmModal';
import * as Illustrations from './Icon/Illustrations';
import AuthenticationSuccessfullNotification from './AuthenticationSuccessfullNotification';

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

    const wasRegistrationSuccessful = false; // CHANGE TO FALSE IF YOU WANT TO TEST ERROR PAGE -> this should be replaced by the actual logic checking if the registration was successfull

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
                onModalHide={() => {
                    if (!shouldNotifyAboutSuccess) {return;}
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
            <AuthenticationSuccessfullNotification isVisible={isNotificationVisible} onConfirm={() => handleClose()}/>
        </View>
    );
}

EnableBiometrcicsModal.displayName = 'EnableBiometricsModal';

export default EnableBiometrcicsModal;
