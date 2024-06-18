import React, {useEffect, useState} from 'react';
import { Linking } from 'react-native';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import ConfirmModal from './ConfirmModal';
import * as Illustrations from './Icon/Illustrations';

type LocationPermissionModalProps = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied */
    onDeny: (permission: PermissionStatus) => void;

    /** Should start the permission flow? */
    startPermissionFlow: boolean;
};

function LocationPermissionModal({startPermissionFlow, onDeny, onGrant}: LocationPermissionModalProps) {
    const [hasError, setHasError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        getLocationPermission().then((status) => {
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                return onGrant();
            }

            setShowModal(true);
            setHasError(status === RESULTS.BLOCKED || status === RESULTS.DENIED);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    const errorHandler = (cb: () => void) => () => {
        if (hasError && Linking.openSettings) {
            Linking.openSettings();
            return;
        }
        cb();
    }

    const onConfirm = errorHandler(() => {
        requestLocationPermission()
            .then((status) => {
                if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                    onGrant();
                } else {
                    onDeny(status);
                }
            })
            .catch(() => {
                onDeny(RESULTS.BLOCKED);
            })
            .finally(() => {
                setShowModal(false);
                setHasError(false);
            });
    });

    const onCancel = () => {
        onDeny(RESULTS.DENIED);
        setShowModal(false);
        setHasError(false);
    };

    return (
        <ConfirmModal
            isVisible={showModal}
            onConfirm={onConfirm}
            onCancel={onCancel}
            confirmText={hasError ? translate('common.settings') : translate('common.continue')}
            cancelText={translate('common.notNow')}
            prompt={translate(hasError ? 'receipt.locationErrorMessage' : 'receipt.locationAccessMessage')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate(hasError ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            iconSource={Illustrations.ReceiptLocationMarker}
            iconFill={false}
            iconWidth={140}
            iconHeight={120}
            shouldCenterIcon
            shouldReverseStackedButtons
        />
    );
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
