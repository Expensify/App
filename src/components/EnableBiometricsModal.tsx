import React, {useState} from 'react';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useSingleExecution from '@hooks/useSingleExecution';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import { View } from 'react-native';
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
                title="Use your face or fingerprint to verify transactions."
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
                prompt="Enable biometric security to use your face or fingerprint to verify transactions quickly and easily. No passwords or special codes needed."
                confirmText="Continue"
                cancelText="Not now"
                shouldReverseStackedButtons
                image={Illustrations.SimpleSmartscan}
            />
            <AuthenticationSuccessfullNotification isVisible={isNotificationVisible} onConfirm={() => handleClose()}/>
        </View>
    );
}

EnableBiometrcicsModal.displayName = 'EnableBiometricsModal';

export default EnableBiometrcicsModal;
