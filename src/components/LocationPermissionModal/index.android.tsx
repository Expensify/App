import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';

import {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';

import type LocationPermissionModalProps from './types';

const isPermissionGranted = (status: string) => status === RESULTS.GRANTED || status === RESULTS.LIMITED;

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const isModalActiveRef = useRef(false);
    const dismissedViaBackdropRef = useRef(false);
    const onGrantRef = useRef(onGrant);
    const onDenyRef = useRef(onDeny);
    const resetPermissionFlowRef = useRef(resetPermissionFlow);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const {showConfirmModal, closeModal} = useConfirmModal();

    // Keep refs up to date
    useEffect(() => {
        onGrantRef.current = onGrant;
        onDenyRef.current = onDeny;
        resetPermissionFlowRef.current = resetPermissionFlow;
    }, [onGrant, onDeny, resetPermissionFlow]);

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        let ignore = false;

        const showPermissionModal = async (hasError: boolean) => {
            if (ignore) {
                return;
            }

            isModalActiveRef.current = true;

            const {action} = await showConfirmModal({
                confirmText: hasError ? translate('common.settings') : translate('common.continue'),
                cancelText: translate('common.notNow'),
                prompt: translate(hasError ? 'receipt.locationErrorMessage' : 'receipt.locationAccessMessage'),
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
                onBackdropPress: () => {
                    dismissedViaBackdropRef.current = true;
                    closeModal();
                    resetPermissionFlowRef.current();
                },
                isConfirmLoading: false,
            });
            if (ignore) {
                return;
            }

            // User cancelled/dismissed — the modal already closed itself internally
            if (action !== ModalActions.CONFIRM) {
                isModalActiveRef.current = false;
                // A backdrop tap just dismisses the prompt - it's not an explicit denial, unlike tapping "Not now".
                if (!dismissedViaBackdropRef.current) {
                    onDenyRef.current(true);
                }
                dismissedViaBackdropRef.current = false;
                return;
            }

            // When hasError (permission is blocked), close the modal and send the user to Settings.
            // We need to close modal manually since the modal is still open (due to isConfirmLoading)
            if (hasError) {
                isModalActiveRef.current = false;
                closeModal();
                Linking.openSettings?.();
                resetPermissionFlowRef.current();
                return;
            }

            // Request permission and handle result
            const status = await requestLocationPermission();
            if (ignore) {
                return;
            }

            isModalActiveRef.current = false;
            closeModal();

            if (isPermissionGranted(status)) {
                onGrantRef.current();
            } else if (status === RESULTS.BLOCKED) {
                // Permission is permanently blocked (e.g. "Don't ask again") — re-show the modal with
                // the error copy so the user can be redirected to Settings to grant it manually.
                showPermissionModal(true);
            } else {
                onDenyRef.current(false);
            }
        };

        const checkInitialPermission = async () => {
            const status = await getLocationPermission();
            if (ignore) {
                return;
            }

            onInitialGetLocationCompleted?.();

            if (isPermissionGranted(status)) {
                onGrantRef.current();
            } else {
                showPermissionModal(status === RESULTS.BLOCKED);
            }
        };

        checkInitialPermission();

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
