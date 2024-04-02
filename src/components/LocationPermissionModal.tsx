import React from 'react';
import LocationMarker from '@assets/images/receipt-location-marker.svg';
import ConfirmModal from './ConfirmModal';

type LocationPermissionModalProps = {
    /** A callback to call when the form has been submitted */
    onConfirm: () => void;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** Modal visibility */
    isVisible: boolean;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;
};

function LocationPermissionModal({
    shouldSetModalVisibility = true,
    onModalHide = () => {},
    isVisible,
    onConfirm,
    onCancel,
}: LocationPermissionModalProps) {

    return (
        <ConfirmModal
            isVisible={isVisible}
            onConfirm={onConfirm}
            onCancel={onCancel}
            confirmText='Continue'
            cancelText='Not now'
            prompt='Enabling location access will help accurately determine your default currency and timezone. Tap settings to enable location access.'
            title='Allow location access'
            shouldSetModalVisibility={shouldSetModalVisibility}
            iconSource={LocationMarker}
            onModalHide={onModalHide}
        />
    );
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
