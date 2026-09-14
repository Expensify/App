import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {getBackgroundPermissionsAsync, getForegroundPermissionsAsync, PermissionStatus, requestBackgroundPermissionsAsync, requestForegroundPermissionsAsync} from 'expo-location';
import {useEffect, useRef} from 'react';
import {Linking} from 'react-native';

import type BackgroundLocationPermissionsFlowProps from './types';

async function requestForegroundPermissions({
    onSuccess,
    onError,
    onPreciseLocationNotGranted,
}: {
    onSuccess: () => Promise<void>;
    onPreciseLocationNotGranted: () => Promise<void>;
    onError: () => void;
}) {
    try {
        const {status, android} = await requestForegroundPermissionsAsync();

        if (status === PermissionStatus.GRANTED && android?.accuracy === 'fine') {
            await onSuccess();
        }

        if (android?.accuracy !== 'fine') {
            await onPreciseLocationNotGranted();
        }
    } catch (e) {
        console.error('[GPS distance request] Failed to request foreground location permissions: ', e);
        onError();
    }
}

async function requestBackgroundPermissions(onGrant: () => void, onError: () => void) {
    try {
        const {status} = await requestBackgroundPermissionsAsync();

        if (status === PermissionStatus.GRANTED) {
            onGrant();
        }
    } catch (e) {
        console.error('[GPS distance request] Failed to request background location permissions: ', e);
        onError();
    }
}

async function checkPermissions({
    onGrant,
    onDeny,
    onAskForPermissions,
    onError,
}: Pick<BackgroundLocationPermissionsFlowProps, 'onDeny' | 'onGrant'> & {onAskForPermissions: () => void; onError: () => void}) {
    try {
        const {granted, canAskAgain, android} = await getForegroundPermissionsAsync();

        if ((!granted || android?.accuracy !== 'fine') && !canAskAgain) {
            onDeny();
            return;
        }

        const {granted: bgGranted, canAskAgain: bgCanAskAgain} = await getBackgroundPermissionsAsync();

        if (!bgGranted && !bgCanAskAgain) {
            onDeny();
            return;
        }

        if (granted && bgGranted && android?.accuracy === 'fine') {
            onGrant();
            return;
        }

        onAskForPermissions();
    } catch (e) {
        console.error('[GPS distance request] Failed to get location permissions: ', e);
        onError();
    }
}

function BackgroundLocationPermissionsFlow({startPermissionsFlow, setStartPermissionsFlow, onGrant, onDeny, onError}: BackgroundLocationPermissionsFlowProps) {
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();

    const onGrantRef = useRef(onGrant);
    const onDenyRef = useRef(onDeny);
    const onErrorRef = useRef(onError);
    const closeModalRef = useRef(closeModal);
    const isModalActiveRef = useRef(false);

    // The permissions flow outlives a single render, so it reads the parent's callbacks from refs instead of
    // capturing the identities it was started with.
    useEffect(() => {
        onGrantRef.current = onGrant;
        onDenyRef.current = onDeny;
        onErrorRef.current = onError;
        closeModalRef.current = closeModal;
    }, [onGrant, onDeny, onError, closeModal]);

    // The modals live in the global modal stack now, so they are not torn down with this component.
    // Close whichever one is still open if we unmount mid-flow.
    useEffect(
        () => () => {
            if (!isModalActiveRef.current) {
                return;
            }
            isModalActiveRef.current = false;
            closeModalRef.current();
        },
        [],
    );

    useEffect(() => {
        if (!startPermissionsFlow) {
            return;
        }

        const sharedModalOptions = {
            cancelText: translate('common.dismiss'),
            iconSource: ReceiptLocationMarker,
            iconFill: false as const,
            iconWidth: 140,
            iconHeight: 120,
            shouldCenterIcon: true,
            shouldReverseStackedButtons: true,
        };

        // showConfirmModal resolves after the modal finished hiding, so anything awaiting it - the next modal in the
        // chain or a native permission prompt - only runs once the current modal is gone.
        const showStepModal = async (options: Parameters<typeof showConfirmModal>[0]) => {
            isModalActiveRef.current = true;
            const {action} = await showConfirmModal(options);
            isModalActiveRef.current = false;

            return action === ModalActions.CONFIRM;
        };

        const showPreciseLocationModal = async () => {
            const isConfirmed = await showStepModal({
                ...sharedModalOptions,
                title: translate('gps.preciseLocationRequiredModal.title'),
                prompt: translate('gps.preciseLocationRequiredModal.prompt'),
                confirmText: translate('common.settings'),
            });

            if (!isConfirmed) {
                return;
            }

            Linking.openSettings();
        };

        const showBackgroundPermissionsModal = async () => {
            const isConfirmed = await showStepModal({
                ...sharedModalOptions,
                title: translate('gps.androidBackgroundLocationRequiredModal.title'),
                prompt: translate('gps.androidBackgroundLocationRequiredModal.prompt'),
                confirmText: translate('common.settings'),
            });

            if (!isConfirmed) {
                return;
            }

            await requestBackgroundPermissions(
                () => onGrantRef.current(),
                () => onErrorRef.current(),
            );
        };

        const onForegroundPermissionsGranted = async () => {
            const {granted} = await getBackgroundPermissionsAsync();

            // possible when foreground location permissions request was to grant precise location and
            // bg permissions were already granted
            if (granted) {
                onGrantRef.current();
                return;
            }

            await showBackgroundPermissionsModal();
        };

        const showFirstAskModal = async () => {
            const isConfirmed = await showStepModal({
                ...sharedModalOptions,
                title: translate('gps.locationRequiredModal.title'),
                prompt: translate('gps.locationRequiredModal.prompt'),
                confirmText: translate('gps.locationRequiredModal.allow'),
            });

            if (!isConfirmed) {
                return;
            }

            await requestForegroundPermissions({
                onSuccess: onForegroundPermissionsGranted,
                onError: () => onErrorRef.current(),
                onPreciseLocationNotGranted: showPreciseLocationModal,
            });
        };

        checkPermissions({
            onGrant: () => onGrantRef.current(),
            onDeny: () => onDenyRef.current(),
            onError: () => onErrorRef.current(),
            onAskForPermissions: () => {
                showFirstAskModal();
            },
        });
        setStartPermissionsFlow(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the flow must only start when startPermissionsFlow flips to true, every other value is read from a ref or is stable
    }, [startPermissionsFlow]);

    return null;
}

export default BackgroundLocationPermissionsFlow;
