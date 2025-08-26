import React from 'react';
import ConfirmModal from './ConfirmModal';
import ScreenWrapper from './ScreenWrapper';


type AuthenticationSuccessfullNotificationProps = {
    /** Modal visibility */
    isVisible: boolean;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** A callback to set biometrics as enabled (registered) */
    onConfirm?: () => void;
};

function AuthenticationSuccessfullNotification({isVisible, onCancel = () => {}, onConfirm = () => {}}: AuthenticationSuccessfullNotificationProps) {
    return (
        <ScreenWrapper
            testID='EnableBiometricsModal'
        >
            <ConfirmModal
                title="Authentication successful"
                isVisible={isVisible}
                onConfirm={() => {
                    onCancel();
                    onConfirm();
                }}
                prompt="You’ve successfully authenticated using Face ID. "
                confirmText="Got it"
                shouldShowCancelButton={false}
            />
        </ScreenWrapper>
    );
}

export default AuthenticationSuccessfullNotification;
