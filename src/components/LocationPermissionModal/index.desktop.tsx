import React, {useEffect, useMemo, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import ConfirmModal from '@components/ConfirmModal';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import CONST from '@src/CONST';
import type {LocationPermissionModalProps} from './types';
import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant}: LocationPermissionModalProps) {
    const [hasError, setHasError] = useState(false);
    const [locationSettingOpened, setLocationSettingOpened] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        getLocationPermission().then((status) => {
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                return onGrant();
            }

            setShowModal(true);
            setHasError(status === RESULTS.BLOCKED);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    const handledBlockedPermission = (cb: () => void) => () => {
        if (hasError) {
            window.electron.invoke(ELECTRON_EVENTS.OPEN_LOCATION_SETTING)
            // setShowModal(false);
            setLocationSettingOpened(true);
            return;
        }
        cb();
    };

    const grantLocationPermission = handledBlockedPermission(() => {
        requestLocationPermission()
            .then((status) => {
                if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                    onGrant();
                } else {
                    onDeny();
                }
            })
            .finally(() => {
                setShowModal(false);
                setHasError(false);
                setLocationSettingOpened(false);
            });
    });

    const skipLocationPermission = () => {
        onDeny();
        setShowModal(false);
        setHasError(false);
        setLocationSettingOpened(false);
    };

    const getConfirmText = (): string => {
        if (!hasError) {
            return translate('common.continue');
        }

        if(locationSettingOpened) {
            return translate('common.relaunch');
        }

        return translate('common.settings');
    };

    const closeModal = () => {
        setShowModal(false);
        resetPermissionFlow();
    };

    const relaunchApp = () => {
        window.electron.invoke(ELECTRON_EVENTS.RELAUNCH_APP);
    }

    const locationErrorMessage = useMemo(() => (isWeb ? 'receipt.allowLocationFromSetting' : locationSettingOpened ? 'receipt.relaunchToTakeEffect' : 'receipt.locationErrorMessage'), [isWeb, locationSettingOpened]);

    return (
        <ConfirmModal
            shouldShowCancelButton={!(isWeb && hasError)}
            onModalHide={() => {
                setHasError(false);
                setLocationSettingOpened(false);
                resetPermissionFlow();
            }}
            isVisible={showModal}
            onConfirm={hasError && locationSettingOpened ? relaunchApp : grantLocationPermission}
            onCancel={skipLocationPermission}
            onBackdropPress={closeModal}
            confirmText={getConfirmText()}
            cancelText={translate('common.notNow')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate(hasError ? (locationSettingOpened ? 'receipt.locationRelaunchTitle' : 'receipt.locationErrorTitle') : 'receipt.locationAccessTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            iconSource={Illustrations.ReceiptLocationMarker}
            iconFill={false}
            iconWidth={140}
            iconHeight={120}
            shouldCenterIcon
            shouldReverseStackedButtons
            prompt={translate(hasError ? locationErrorMessage : 'receipt.locationAccessMessage')}
        />
    );
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
