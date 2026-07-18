import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolling from '@hooks/usePolling';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';

import CONST from '@src/CONST';

import {useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';

import type LocationPermissionModalProps from './types';

const isPermissionGranted = (status: string) => status === RESULTS.GRANTED || status === RESULTS.LIMITED;

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const [showModal, setShowModal] = useState(false);
    const isGrantedExternallyRef = useRef(false);
    const isModalActiveRef = useRef(false);
    const onGrantRef = useRef(onGrant);
    const onDenyRef = useRef(onDeny);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const {showConfirmModal, closeModal} = useConfirmModal();

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    // Keep refs up to date
    useEffect(() => {
        onGrantRef.current = onGrant;
        onDenyRef.current = onDeny;
    }, [onGrant, onDeny]);

    const grantPermission = () => {
        isGrantedExternallyRef.current = true;
        onGrantRef.current();
    };

    const checkPermission = async () => {
        const status = await getLocationPermission();
        if (!isPermissionGranted(status) || isGrantedExternallyRef.current) {
            return;
        }
        grantPermission();
    };

    usePolling(checkPermission, CONST.TIMING.LOCATION_UPDATE_INTERVAL, showModal, CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        let ignore = false;

        const resetFlowState = () => {
            isModalActiveRef.current = false;
            setShowModal(false);
            resetPermissionFlow();
        };

        const handlePermissionFlow = async () => {
            const status = await getLocationPermission();
            if (ignore) {
                return;
            }

            onInitialGetLocationCompleted?.();
            if (isPermissionGranted(status)) {
                grantPermission();
                return;
            }

            const hasError = status === RESULTS.BLOCKED;
            isGrantedExternallyRef.current = false;
            setShowModal(true);
            isModalActiveRef.current = true;

            const locationErrorMessage = isWeb ? 'receipt.allowLocationFromSetting' : 'receipt.locationErrorMessage';
            const confirmText = !hasError ? translate('common.continue') : translate(isWeb ? 'common.buttonConfirm' : 'common.settings');

            const {action} = await showConfirmModal({
                shouldShowCancelButton: !(isWeb && hasError),
                confirmText,
                cancelText: translate('common.notNow'),
                promptStyles: [styles.textLabelSupportingEmptyValue, styles.mb4],
                title: translate(hasError ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle'),
                titleContainerStyles: [styles.mt2, styles.mb0],
                titleStyles: [styles.textHeadline],
                iconSource: ReceiptLocationMarker,
                iconFill: false,
                iconWidth: 140,
                iconHeight: 120,
                shouldCenterIcon: true,
                shouldReverseStackedButtons: true,
                prompt: translate(hasError ? locationErrorMessage : 'receipt.locationAccessMessage'),
                onBackdropPress: () => {
                    closeModal();
                    resetFlowState();
                },
                isConfirmLoading: false,
            });
            if (ignore) {
                return;
            }

            // Already handled by the visibility listener
            if (isGrantedExternallyRef.current) {
                resetFlowState();
                return;
            }

            if (action !== ModalActions.CONFIRM) {
                resetFlowState();
                onDenyRef.current(true);
                return;
            }

            // When hasError (permission is blocked), close the modal and send the user to Settings.
            // We need to close modal manually since the modal is still open (due to isConfirmLoading)
            if (hasError && Linking.openSettings) {
                Linking.openSettings();
                closeModal();
                resetFlowState();
                return;
            }

            // For the blocked/error case without a settings deep link, re-check permission in case the user
            // enabled it before continuing. Otherwise, actively request permission for the first-time prompt.
            const result = hasError ? await getLocationPermission() : await requestLocationPermission();
            if (ignore) {
                return;
            }

            closeModal();
            resetFlowState();
            if (isPermissionGranted(result)) {
                grantPermission();
            } else {
                onDenyRef.current(false);
            }
        };

        handlePermissionFlow();

        return () => {
            ignore = true;
            if (!isModalActiveRef.current) {
                return;
            }
            isModalActiveRef.current = false;
            closeModal();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    return null;
}

export default LocationPermissionModal;
