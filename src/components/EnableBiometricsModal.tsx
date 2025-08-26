import React, {useState} from 'react';
import ConfirmModal from './ConfirmModal';
import * as Illustrations from './Icon/Illustrations';
import ScreenWrapper from './ScreenWrapper';
import AuthenticationSuccessfullNotification from './AuthenticationSuccessfullNotification';


type EnableBiometrcicsVerificationProps = {
    /** Modal visibility */
    isVisible: boolean;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** A callback to set biometrics as enabled (registered) */
    registerBiometrics?: () => void;
};

function EnableBiometrcicsModal({isVisible, onCancel = () => {}, registerBiometrics = () => {}}: EnableBiometrcicsVerificationProps) {
    const [isSoftPromptVisisble, setSoftPromptVisibility] = useState(true);
    const [isSuccessfullyNotificationVisible, setSuccess] = useState(false)
    const handleClose = () => {
        setSoftPromptVisibility(true);
        setSuccess(false);
        onCancel();
    };

    return (
        <ScreenWrapper
            testID='EnableBiometricsModal'
        >
            {isSoftPromptVisisble && (
            <ConfirmModal
                title="Use your face or fingerprint to verify transactions."
                isVisible={isVisible}
                onConfirm={() => {
                    setSuccess(true);
                    setSoftPromptVisibility(false);
                }}
                onCancel={onCancel}
                prompt="Enable biometric security to use your face or fingerprint to verify transactions quickly and easily. No passwords or special codes needed."
                confirmText="Continue"
                cancelText="Not now"
                shouldReverseStackedButtons
                image={Illustrations.SimpleSmartscan}
                imageStyles={{width: 204, height: 204}}
            />
            )}
            {isSuccessfullyNotificationVisible && (
                <AuthenticationSuccessfullNotification isVisible onCancel={() => handleClose()} onConfirm={() => registerBiometrics()} />
            )}
        </ScreenWrapper>
    );
}

export default EnableBiometrcicsModal;
