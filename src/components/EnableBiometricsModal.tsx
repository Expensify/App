import React from 'react';
import ConfirmModal from './ConfirmModal';
import * as Illustrations from './Icon/Illustrations';


type EnableBiometrcicsVerificationProps = {
    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** Modal visibility */
    isVisible: boolean;
};

function EnableBiometrcicsModal({onCancel = () => {}, isVisible}: EnableBiometrcicsVerificationProps) {
    return (
        <ConfirmModal
            title="Use your face or fingerprint to verify transactions."
            isVisible={isVisible}
            onConfirm={() => {}}
            onCancel={onCancel}
            prompt="Enable biometric security to use your face or fingerprint to verify transactions quickly and easily. No passwords or special codes needed."
            confirmText="Continue"
            cancelText="Not now"
            shouldReverseStackedButtons
            image={Illustrations.SimpleIllustrationSmartscan}
            imageStyles={{width: 204, height: 204, alignSelf: 'center'}}
        />
    );
}

export default EnableBiometrcicsModal;
