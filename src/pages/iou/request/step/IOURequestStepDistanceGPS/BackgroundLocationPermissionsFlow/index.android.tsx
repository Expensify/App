import {getBackgroundPermissionsAsync, getForegroundPermissionsAsync, PermissionStatus, requestBackgroundPermissionsAsync, requestForegroundPermissionsAsync} from 'expo-location';
import React, {useCallback, useEffect, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type BackgroundLocationPermissionsFlowProps from './types';

async function requestForegroundPermissions(onSuccess: () => Promise<void>, onError: () => void) {
    try {
        const {status, android} = await requestForegroundPermissionsAsync();

        if (status === PermissionStatus.GRANTED && android?.accuracy === 'fine') {
            await onSuccess();
        }
    } catch (e) {
        console.error('[GPS distance request] Failed to request foreground location permissions: ', e);
        onError();
    }
}

async function requestBackgroundPermissions(onSuccess: () => void, onError: () => void) {
    try {
        const {status} = await requestBackgroundPermissionsAsync();

        if (status === PermissionStatus.GRANTED) {
            onSuccess();
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

        if (granted && android?.accuracy === 'fine' && bgGranted) {
            onGrant();
            return;
        }

        onAskForPermissions();
    } catch (e) {
        console.error('[GPS distance request] Failed to get location permissions: ', e);
        onError();
    }
}

function BackgroundLocationPermissionsFlow({startPermissionsFlow, setStartPermissionsFlow, onGrant, onDeny, setShouldShowPermissionsError}: BackgroundLocationPermissionsFlowProps) {
    const [showFirstAskModal, setShowFirstAskModal] = useState(false);
    const [showBgPermissionsModal, setShowBgPermissionsModal] = useState(false);
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const {translate} = useLocalize();

    const onError = useCallback(() => setShouldShowPermissionsError(true), [setShouldShowPermissionsError]);

    const onForegroundPermissionsGranted = async () => {
        const {granted} = await getBackgroundPermissionsAsync();

        // possible when foreground permissions request was to grant precise location and
        // bg permissions were already granted
        if (granted) {
            onGrant();
            return;
        }

        setShowBgPermissionsModal(true);
    };

    useEffect(() => {
        if (!startPermissionsFlow) {
            return;
        }

        checkPermissions({onGrant, onDeny, onError, onAskForPermissions: () => setShowFirstAskModal(true)});
        setStartPermissionsFlow(false);
    }, [startPermissionsFlow, onGrant, onDeny, setStartPermissionsFlow, onError]);

    return (
        <>
            <ConfirmModal
                isVisible={showFirstAskModal}
                title={translate('gps.locationRequiredModal.title')}
                onCancel={() => setShowFirstAskModal(false)}
                onConfirm={() => {
                    setShowFirstAskModal(false);
                    requestForegroundPermissions(onForegroundPermissionsGranted, onError);
                }}
                confirmText={translate('gps.locationRequiredModal.allow')}
                cancelText={translate('common.dismiss')}
                prompt={translate('gps.locationRequiredModal.prompt')}
                iconSource={ReceiptLocationMarker}
                iconFill={false}
                iconWidth={140}
                iconHeight={120}
                shouldCenterIcon
                shouldReverseStackedButtons
            />
            <ConfirmModal
                isVisible={showBgPermissionsModal}
                title={translate('gps.androidBackgroundLocationRequiredModal.title')}
                onCancel={() => setShowBgPermissionsModal(false)}
                onConfirm={() => {
                    setShowBgPermissionsModal(false);
                    requestBackgroundPermissions(onGrant, onError);
                }}
                confirmText={translate('common.settings')}
                cancelText={translate('common.dismiss')}
                prompt={translate('gps.androidBackgroundLocationRequiredModal.prompt')}
                iconSource={ReceiptLocationMarker}
                iconFill={false}
                iconWidth={140}
                iconHeight={120}
                shouldCenterIcon
                shouldReverseStackedButtons
            />
        </>
    );
}

export default BackgroundLocationPermissionsFlow;
