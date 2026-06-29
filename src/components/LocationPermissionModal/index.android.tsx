import {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type LocationPermissionModalProps from './types';

const isPermissionGranted = (status: string) => status === RESULTS.GRANTED || status === RESULTS.LIMITED;

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const isModalActiveRef = useRef(false);
    const onGrantRef = useRef(onGrant);
    const onDenyRef = useRef(onDeny);
    const resetPermissionFlowRef = useRef(resetPermissionFlow);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker' as IllustrationName));
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

        const showPermissionModal = (hasError: boolean) => {
            if (ignore) {
                return;
            }

            isModalActiveRef.current = true;

            showConfirmModal({
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
                onBackdropPress: () => resetPermissionFlowRef.current(),
            }).then(({action}) => {
                if (ignore) {
                    return;
                }

                isModalActiveRef.current = false;

                if (action !== ModalActions.CONFIRM) {
                    onDenyRef.current(true);
                    return;
                }

                // Open settings if permission is blocked
                if (hasError) {
                    Linking.openSettings?.();
                    resetPermissionFlowRef.current();
                    return;
                }

                // Request permission and handle result
                requestLocationPermission().then((status) => {
                    if (ignore) {
                        return;
                    }

                    if (isPermissionGranted(status)) {
                        onGrantRef.current();
                    } else if (status === RESULTS.BLOCKED) {
                        closeModal();
                        showPermissionModal(true);
                    } else {
                        onDenyRef.current(false);
                    }
                });
            });
        };

        const checkInitialPermission = () => {
            getLocationPermission().then((status) => {
                if (ignore) {
                    return;
                }

                onInitialGetLocationCompleted?.();

                if (isPermissionGranted(status)) {
                    onGrantRef.current();
                } else {
                    showPermissionModal(status === RESULTS.BLOCKED);
                }
            });
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
