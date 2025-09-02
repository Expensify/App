import React, {useState} from 'react';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useSingleExecution from '@hooks/useSingleExecution';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
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
    const [isSuccessfullyNotificationVisible, setSuccess] = useState(false);
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const action = singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.ENABLE_BIOMETRICS_ERROR_PAGE)));

    const handleClose = () => {
        onCancel();
        setSuccess(false);
        setSoftPromptVisibility(true);
    };

    const wasRegistrationSuccessful = true; // CHANGE TO FALSE IF YOU WANT TO TEST ERROR PAGE -> this should be replaced by the actual logic checking if the registration was successfull

    return (
        <ScreenWrapper
            testID={EnableBiometrcicsModal.displayName}
        >
            {isSoftPromptVisisble && (
            <ConfirmModal
                title="Use your face or fingerprint to verify transactions."
                isVisible={isVisible}
                onConfirm={() => {
                    if (wasRegistrationSuccessful) {
                        registerBiometrics();
                        setSoftPromptVisibility(false);
                        setSuccess(true);
                    } else {
                        handleClose();
                        action();
                    }
                }}
                onCancel={onCancel}
                prompt="Enable biometric security to use your face or fingerprint to verify transactions quickly and easily. No passwords or special codes needed."
                confirmText="Continue"
                cancelText="Not now"
                shouldReverseStackedButtons
                image={Illustrations.SimpleSmartscan}
            />
            )}
            {isSuccessfullyNotificationVisible && (
                <AuthenticationSuccessfullNotification isVisible onConfirm={() => handleClose()}/>
            )}
        </ScreenWrapper>
    );
}

EnableBiometrcicsModal.displayName = 'EnableBiometricsModal';

export default EnableBiometrcicsModal;
