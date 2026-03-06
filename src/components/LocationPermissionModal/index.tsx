import lodashDebounce from 'lodash/debounce';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Visibility from '@libs/Visibility';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import CONST from '@src/CONST';
import type {LocationPermissionModalProps} from './types';

const isPermissionGranted = (status: string) => status === RESULTS.GRANTED || status === RESULTS.LIMITED;

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const [showModal, setShowModal] = useState(false);
    const isGrantedExternallyRef = useRef(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker' as IllustrationName));
    const confirmModal = useConfirmModal();

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    const checkPermission = useCallback(async () => {
        const status = await getLocationPermission();
        if (isPermissionGranted(status) && !isGrantedExternallyRef.current) {
            // Prevent `onGrant` from being called twice when modal closes
            isGrantedExternallyRef.current = true;
            confirmModal.closeModal();
            onGrant();
        }
    }, [onGrant, confirmModal]);

    const handlePermissionResult = (status: string) => {
        if (isPermissionGranted(status)) {
            onGrant();
        } else {
            onDeny();
        }
    };

    const debouncedCheckPermission = useMemo(() => lodashDebounce(checkPermission, CONST.TIMING.USE_DEBOUNCED_STATE_DELAY), [checkPermission]);

    useEffect(() => {
        if (!showModal) {
            return;
        }

        const unsubscribe = Visibility.onVisibilityChange(() => {
            debouncedCheckPermission();
        });

        const intervalId = setInterval(() => {
            debouncedCheckPermission();
        }, CONST.TIMING.LOCATION_UPDATE_INTERVAL);

        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, [showModal, debouncedCheckPermission]);

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        getLocationPermission().then((status) => {
            onInitialGetLocationCompleted?.();
            if (isPermissionGranted(status)) {
                return onGrant();
            }

            const hasError = status === RESULTS.BLOCKED;
            isGrantedExternallyRef.current = false;
            setShowModal(true);

            const locationErrorMessage = isWeb ? 'receipt.allowLocationFromSetting' : 'receipt.locationErrorMessage';
            let confirmText: string;
            if (!hasError) {
                confirmText = translate('common.continue');
            } else if (isWeb) {
                confirmText = translate('common.buttonConfirm');
            } else {
                confirmText = translate('common.settings');
            }

            confirmModal
                .showConfirmModal({
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
                })
                .then(({action}) => {
                    setShowModal(false);
                    resetPermissionFlow();

                    if (isGrantedExternallyRef.current) {
                        // Already handled by the visibility listener
                        return;
                    }

                    if (action !== ModalActions.CONFIRM) {
                        onDeny?.();
                        return;
                    }

                    if (hasError) {
                        if (Linking.openSettings) {
                            Linking.openSettings();
                        } else {
                            // Check one more time in case user enabled location before continuing
                            getLocationPermission().then(handlePermissionResult);
                        }
                        return;
                    }

                    requestLocationPermission().then(handlePermissionResult);
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    return null;
}

export default LocationPermissionModal;
