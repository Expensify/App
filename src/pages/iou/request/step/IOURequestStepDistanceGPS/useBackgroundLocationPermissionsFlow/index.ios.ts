/**
 * Drives the iOS location permission chain GPS distance tracking needs: the first ask modal, then the precise
 * location modal. Returns the function that starts the chain.
 */
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {getBackgroundPermissionsAsync, getForegroundPermissionsAsync, PermissionStatus, requestBackgroundPermissionsAsync, requestForegroundPermissionsAsync} from 'expo-location';
import {useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import {checkLocationAccuracy} from 'react-native-permissions';

import type BackgroundLocationPermissionsFlowCallbacks from './types';

async function requestPermissions({
    onGrant,
    onError,
    onPreciseLocationNotGranted,
}: Pick<BackgroundLocationPermissionsFlowCallbacks, 'onGrant' | 'onError'> & {onPreciseLocationNotGranted: () => Promise<void>}) {
    try {
        const {status: fgStatus} = await requestForegroundPermissionsAsync();

        if (fgStatus !== PermissionStatus.GRANTED) {
            return;
        }

        const {status} = await requestBackgroundPermissionsAsync();

        if (status !== PermissionStatus.GRANTED) {
            return;
        }

        const accuracy = await checkLocationAccuracy();

        if (accuracy === 'full') {
            onGrant();
            return;
        }

        await onPreciseLocationNotGranted();
    } catch (e) {
        console.error('[GPS distance request] Failed to request location permissions: ', e);
        onError();
    }
}

async function checkPermissions({
    onGrant,
    onDeny,
    onAskForPermissions,
    onPreciseLocationNotGranted,
    onError,
}: BackgroundLocationPermissionsFlowCallbacks & {onAskForPermissions: () => Promise<void>; onPreciseLocationNotGranted: () => Promise<void>}) {
    try {
        const {granted, canAskAgain} = await getForegroundPermissionsAsync();

        if (!canAskAgain && !granted) {
            onDeny();
            return;
        }

        const {granted: bgGranted, canAskAgain: bgCanAskAgain} = await getBackgroundPermissionsAsync();

        if (!bgCanAskAgain && !bgGranted) {
            onDeny();
            return;
        }

        if (granted && bgGranted) {
            const accuracy = await checkLocationAccuracy();

            if (accuracy === 'full') {
                onGrant();
                return;
            }

            await onPreciseLocationNotGranted();
            return;
        }

        await onAskForPermissions();
    } catch (e) {
        console.error('[GPS distance request] Failed to get location permissions: ', e);
        onError();
    }
}

function useBackgroundLocationPermissionsFlow({onError, onGrant, onDeny}: BackgroundLocationPermissionsFlowCallbacks) {
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const {translate} = useLocalize();
    const {showConfirmModal, closeModal} = useConfirmModal();

    const onGrantRef = useRef(onGrant);
    const onDenyRef = useRef(onDeny);
    const onErrorRef = useRef(onError);
    const closeModalRef = useRef(closeModal);
    const isModalActiveRef = useRef(false);
    const isMountedRef = useRef(true);
    const isFlowRunningRef = useRef(false);

    // The flow outlives the render that started it, so it reads the caller's callbacks from refs instead of the
    // identities it was started with.
    useEffect(() => {
        onGrantRef.current = onGrant;
        onDenyRef.current = onDeny;
        onErrorRef.current = onError;
        closeModalRef.current = closeModal;
    }, [onGrant, onDeny, onError, closeModal]);

    // The modals live in the global modal stack, so they are not torn down with the screen that started the flow.
    // Close whichever one is still open if that screen unmounts mid-flow, and stop the flow from opening the next one
    // once a pending native permission prompt resolves.
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (!isModalActiveRef.current) {
                return;
            }
            isModalActiveRef.current = false;
            closeModalRef.current();
        };
    }, []);

    return () => {
        // Every call stacks its own modal in the global modal stack, so a repeated press while the flow is running
        // would show the same modal twice.
        if (isFlowRunningRef.current) {
            return;
        }
        isFlowRunningRef.current = true;

        const sharedModalOptions = {
            cancelText: translate('common.dismiss'),
            iconSource: ReceiptLocationMarker,
            iconFill: false as const,
            iconWidth: 140,
            iconHeight: 120,
            shouldCenterIcon: true,
            shouldReverseStackedButtons: true,
        };

        // showConfirmModal resolves after the modal finished hiding, so the Precise Location modal can be opened from
        // the awaited result of the First Ask modal without the two hide/show animations clashing on iOS.
        const showStepModal = async (options: Parameters<typeof showConfirmModal>[0]) => {
            if (!isMountedRef.current) {
                return false;
            }

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

            await requestPermissions({
                onGrant: () => onGrantRef.current(),
                onError: () => onErrorRef.current(),
                onPreciseLocationNotGranted: showPreciseLocationModal,
            });
        };

        checkPermissions({
            onGrant: () => onGrantRef.current(),
            onDeny: () => onDenyRef.current(),
            onError: () => onErrorRef.current(),
            onAskForPermissions: showFirstAskModal,
            onPreciseLocationNotGranted: showPreciseLocationModal,
        }).finally(() => {
            isFlowRunningRef.current = false;
        });
    };
}

export default useBackgroundLocationPermissionsFlow;
