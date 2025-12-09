import lodashDebounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import ConfirmModal from '@components/ConfirmModal';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Visibility from '@libs/Visibility';
import {getLocationPermission, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import CONST from '@src/CONST';
import type {LocationPermissionModalProps} from './types';

function LocationPermissionModal({startPermissionFlow, resetPermissionFlow, onDeny, onGrant, onInitialGetLocationCompleted}: LocationPermissionModalProps) {
    const [hasError, setHasError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker' as IllustrationName));

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
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                return onGrant();
            }

            setShowModal(true);
            setHasError(status === RESULTS.BLOCKED);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We only want to run this effect when startPermissionFlow changes
    }, [startPermissionFlow]);

    const handledBlockedPermission = (cb: () => void) => () => {
        setIsLoading(true);
        if (hasError) {
            if (Linking.openSettings) {
                Linking.openSettings();
            } else {
                // check one more time in case user enabled location before continue
                getLocationPermission().then((status) => {
                    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                        onGrant();
                    } else {
                        onDeny?.();
                    }
                });
            }
            setShowModal(false);
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
                setIsLoading(false);
                setShowModal(false);
                setHasError(false);
            });
    });

    const skipLocationPermission = () => {
        onDeny();
        setShowModal(false);
        setHasError(false);
    };

    const getConfirmText = (): string => {
        if (!hasError) {
            return translate('common.continue');
        }

        return isWeb ? translate('common.buttonConfirm') : translate('common.settings');
    };

    const closeModal = () => {
        setShowModal(false);
        resetPermissionFlow();
    };

    const locationErrorMessage = useMemo(() => (isWeb ? 'receipt.allowLocationFromSetting' : 'receipt.locationErrorMessage'), [isWeb]);

    return (
        <ConfirmModal
            shouldShowCancelButton={!(isWeb && hasError)}
            onModalHide={() => {
                setHasError(false);
                resetPermissionFlow();
            }}
            isVisible={showModal}
            onConfirm={grantLocationPermission}
            onCancel={skipLocationPermission}
            onBackdropPress={closeModal}
            confirmText={getConfirmText()}
            cancelText={translate('common.notNow')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate(hasError ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            iconSource={ReceiptLocationMarker}
            iconFill={false}
            iconWidth={140}
            iconHeight={120}
            shouldCenterIcon
            shouldReverseStackedButtons
            prompt={translate(hasError ? locationErrorMessage : 'receipt.locationAccessMessage')}
            isConfirmLoading={isLoading}
        />
    );
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
