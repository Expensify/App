import React from 'react';
import LocationMarker from '@assets/images/receipt-location-marker.svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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

function LocationPermissionModal({shouldSetModalVisibility = true, onModalHide = () => {}, isVisible, onConfirm, onCancel}: LocationPermissionModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <ConfirmModal
            isVisible={isVisible}
            onConfirm={onConfirm}
            onCancel={onCancel}
            confirmText={translate('common.continue')}
            cancelText={translate('common.notNow')}
            prompt={translate('receipt.locationAccessMessage')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate('receipt.locationAccessTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            shouldSetModalVisibility={shouldSetModalVisibility}
            iconSource={LocationMarker}
            iconWidth={140}
            iconHeight={120}
            shouldCenterIcon
            onModalHide={onModalHide}
            shouldShowDismissIcon
            shouldReverseStackedButtons
        />
    );
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
