import lodashDebounce from 'lodash/debounce';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Visibility from '@libs/Visibility';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import CONST from '@src/CONST';
import type {LocationPermissionModalProps} from './types';

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker' as IllustrationName));
    const {showConfirmModal} = useConfirmModal();

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    const checkPermission = useCallback(() => {
        getLocationPermission().then((status) => {
            if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
                return;
            }
            onGrant();
        });
    }, [onGrant]);

    const debouncedCheckPermission = useMemo(() => lodashDebounce(checkPermission, CONST.TIMING.USE_DEBOUNCED_STATE_DELAY), [checkPermission]);

    useEffect(() => {
        if (!isModalOpen) {
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
    }, [isModalOpen, debouncedCheckPermission]);

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        getLocationPermission().then((status) => {
            onInitialGetLocationCompleted?.();
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                return onGrant();
            }

            const isBlocked = status === RESULTS.BLOCKED;
            setIsModalOpen(true);

            const locationErrorMessage = isWeb ? 'receipt.allowLocationFromSetting' : 'receipt.locationErrorMessage';

            const handleConfirm = () => {
                setIsLoading(true);
                if (isBlocked) {
                    if (Linking.openSettings) {
                        Linking.openSettings();
                    } else {
                        // check one more time in case user enabled location before continue
                        getLocationPermission().then((currentStatus) => {
                            if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
                                onGrant();
                            } else {
                                onDeny?.();
                            }
                        });
                    }
                    setIsLoading(false);
                    setIsModalOpen(false);
                    return;
                }

                requestLocationPermission()
                    .then((currentStatus) => {
                        if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
                            onGrant();
                        } else {
                            onDeny();
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                        setIsModalOpen(false);
                    });
            };

            const handleCancel = () => {
                onDeny();
                setIsModalOpen(false);
            };

            const handleModalHide = () => {
                resetPermissionFlow();
                setIsModalOpen(false);
            };

            const handleBackdropPress = () => {
                resetPermissionFlow();
                setIsModalOpen(false);
            };

            const getConfirmText = (): string => {
                if (!isBlocked) {
                    return translate('common.continue');
                }

                return isWeb ? translate('common.buttonConfirm') : translate('common.settings');
            };

            showConfirmModal({
                shouldShowCancelButton: !(isWeb && isBlocked),
                onModalHide: handleModalHide,
                onBackdropPress: handleBackdropPress,
                confirmText: getConfirmText(),
                cancelText: translate('common.notNow'),
                promptStyles: [styles.textLabelSupportingEmptyValue, styles.mb4],
                title: translate(isBlocked ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle'),
                titleContainerStyles: [styles.mt2, styles.mb0],
                titleStyles: [styles.textHeadline],
                iconSource: ReceiptLocationMarker,
                iconFill: false,
                iconWidth: 140,
                iconHeight: 120,
                shouldCenterIcon: true,
                shouldReverseStackedButtons: true,
                prompt: translate(isBlocked ? locationErrorMessage : 'receipt.locationAccessMessage'),
                isConfirmLoading: isLoading,
            }).then((result) => {
                if (result.action === 'CONFIRM') {
                    handleConfirm();
                } else {
                    handleCancel();
                }
            });
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    return null;
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
