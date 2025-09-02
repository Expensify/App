import React from 'react';
import { View } from 'react-native';
import ConfirmModal from './ConfirmModal';


type AuthenticationSuccessfullNotificationProps = {
    /** Modal visibility */
    isVisible: boolean;

    /** A callback to call when the form has been closed */
    onConfirm?: () => void;
};

function AuthenticationSuccessfullNotification({isVisible, onConfirm = () => {}}: AuthenticationSuccessfullNotificationProps) {
    return (
        <View>
            <ConfirmModal
                title="Authentication successful"
                isVisible={isVisible}
                onConfirm={() => {
                    onConfirm();
                }}
                prompt="You’ve successfully authenticated using Face ID. "
                confirmText="Got it"
                shouldShowCancelButton={false}
            />
        </View>
    );
}

AuthenticationSuccessfullNotification.displayName = 'AuthenticationSuccessfullNotification';

export default AuthenticationSuccessfullNotification;
