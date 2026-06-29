import lodashDebounce from 'lodash/debounce';
import {useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Visibility from '@libs/Visibility';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import CONST from '@src/CONST';
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

    const debouncedCheckPermissionRef = useRef<ReturnType<typeof lodashDebounce> | null>(null);

    // Initialize debounced function in useEffect to avoid ref access during render
    useEffect(() => {
        debouncedCheckPermissionRef.current = lodashDebounce(() => {
            getLocationPermission().then((status) => {
                if (!isPermissionGranted(status) || isGrantedExternallyRef.current) {
                    return;
                }

                // Prevent `onGrant` from being called twice when modal closes
                isGrantedExternallyRef.current = true;
                onGrantRef.current();
            });
        }, CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
    }, []);

    const handlePermissionResult = (status: string) => {
        if (isPermissionGranted(status)) {
            onGrantRef.current();
        } else {
            onDenyRef.current(false);
        }
    };

    useEffect(() => {
        if (!showModal) {
            return;
        }

        const unsubscribe = Visibility.onVisibilityChange(() => {
            debouncedCheckPermissionRef.current?.();
        });

        const intervalId = setInterval(() => {
            debouncedCheckPermissionRef.current?.();
        }, CONST.TIMING.LOCATION_UPDATE_INTERVAL);

        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, [showModal]);

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        let ignore = false;

        const handlePermissionFlow = () => {
            getLocationPermission().then((status) => {
                if (ignore) {
                    return;
                }

                onInitialGetLocationCompleted?.();
                if (isPermissionGranted(status)) {
                    onGrantRef.current();
                    return;
                }

                const hasError = status === RESULTS.BLOCKED;
                isGrantedExternallyRef.current = false;
                setShowModal(true);
                isModalActiveRef.current = true;

                const locationErrorMessage = isWeb ? 'receipt.allowLocationFromSetting' : 'receipt.locationErrorMessage';
                let confirmText: string;
                if (!hasError) {
                    confirmText = translate('common.continue');
                } else if (isWeb) {
                    confirmText = translate('common.buttonConfirm');
                } else {
                    confirmText = translate('common.settings');
                }

                showConfirmModal({
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
                }).then(({action}) => {
                    if (ignore) {
                        return;
                    }

                    isModalActiveRef.current = false;
                    setShowModal(false);
                    resetPermissionFlow();

                    if (isGrantedExternallyRef.current) {
                        // Already handled by the visibility listener
                        return;
                    }

                    if (action !== ModalActions.CONFIRM) {
                        onDenyRef.current(true);
                        return;
                    }

                    if (hasError) {
                        if (Linking.openSettings) {
                            Linking.openSettings();
                        } else {
                            // Check one more time in case user enabled location before continuing
                            getLocationPermission().then((result) => {
                                if (ignore) {
                                    return;
                                }

                                handlePermissionResult(result);
                            });
                        }
                        return;
                    }

                    requestLocationPermission().then((result) => {
                        if (ignore) {
                            return;
                        }

                        handlePermissionResult(result);
                    });
                });
            });
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
