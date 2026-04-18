import {useEffect} from 'react';
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
import type {LocationPermissionModalProps} from './types';

const isPermissionGranted = (status: string) => status === RESULTS.GRANTED || status === RESULTS.LIMITED;

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker' as IllustrationName));
    const {showConfirmModal} = useConfirmModal();

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        const handlePermissionResult = (hasError: boolean) => {
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
            }).then(({action}) => {
                if (action !== ModalActions.CONFIRM) {
                    onDeny();
                    resetPermissionFlow();
                    return;
                }

                if (hasError && Linking.openSettings) {
                    Linking.openSettings();
                    resetPermissionFlow();
                    return;
                }

                requestLocationPermission().then((status) => {
                    if (isPermissionGranted(status)) {
                        onGrant();
                        resetPermissionFlow();
                    } else if (status === RESULTS.BLOCKED) {
                        handlePermissionResult(true);
                    } else {
                        onDeny();
                        resetPermissionFlow();
                    }
                });
            });
        };

        getLocationPermission().then((status) => {
            onInitialGetLocationCompleted?.();
            if (isPermissionGranted(status)) {
                return onGrant();
            }

            handlePermissionResult(status === RESULTS.BLOCKED);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    return null;
}

export default LocationPermissionModal;
