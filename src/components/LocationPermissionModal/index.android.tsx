import {useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type {LocationPermissionModalProps} from './types';

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker' as IllustrationName));
    const {showConfirmModal} = useConfirmModal();

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

            const handleConfirm = () => {
                setIsLoading(true);
                if (isBlocked && Linking.openSettings) {
                    Linking.openSettings();
                    resetPermissionFlow();
                    setIsLoading(false);
                    return;
                }

                requestLocationPermission()
                    .then((currentStatus) => {
                        if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
                            onGrant();
                        } else if (currentStatus === RESULTS.BLOCKED) {
                            // Re-show modal with blocked state
                            showConfirmModal({
                                confirmText: translate('common.settings'),
                                cancelText: translate('common.notNow'),
                                prompt: translate('receipt.locationErrorMessage'),
                                promptStyles: [styles.textLabelSupportingEmptyValue, styles.mb4],
                                title: translate('receipt.locationErrorTitle'),
                                titleContainerStyles: [styles.mt2, styles.mb0],
                                titleStyles: [styles.textHeadline],
                                iconSource: ReceiptLocationMarker,
                                iconFill: false,
                                iconWidth: 140,
                                iconHeight: 120,
                                shouldCenterIcon: true,
                                shouldReverseStackedButtons: true,
                                isConfirmLoading: false,
                            }).then((result) => {
                                if (result.action === 'CONFIRM') {
                                    if (Linking.openSettings) {
                                        Linking.openSettings();
                                    }
                                    resetPermissionFlow();
                                } else {
                                    onDeny();
                                }
                            });
                        } else {
                            onDeny();
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            };

            const handleCancel = () => {
                onDeny();
            };

            const handleBackdropPress = () => {
                resetPermissionFlow();
            };

            showConfirmModal({
                onBackdropPress: handleBackdropPress,
                confirmText: isBlocked ? translate('common.settings') : translate('common.continue'),
                cancelText: translate('common.notNow'),
                prompt: translate(isBlocked ? 'receipt.locationErrorMessage' : 'receipt.locationAccessMessage'),
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
