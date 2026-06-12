import {getBackgroundPermissionsAsync, getForegroundPermissionsAsync, PermissionStatus, requestBackgroundPermissionsAsync, requestForegroundPermissionsAsync} from 'expo-location';
import React, {useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import {checkLocationAccuracy} from 'react-native-permissions';
import ConfirmModal from '@components/ConfirmModal';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type BackgroundLocationPermissionsFlowProps from './types';

async function requestPermissions({
    onGrant,
    onError,
    onPreciseLocationNotGranted,
}: Pick<BackgroundLocationPermissionsFlowProps, 'onGrant'> & {onPreciseLocationNotGranted: () => void; onError: () => void}) {
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

        onPreciseLocationNotGranted();
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
}: Pick<BackgroundLocationPermissionsFlowProps, 'onDeny' | 'onGrant'> & {onAskForPermissions: () => void; onPreciseLocationNotGranted: () => void; onError: () => void}) {
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

            onPreciseLocationNotGranted();
            return;
        }

        onAskForPermissions();
    } catch (e) {
        console.error('[GPS distance request] Failed to get location permissions: ', e);
        onError();
    }
}

function BackgroundLocationPermissionsFlow({startPermissionsFlow, setStartPermissionsFlow, onError, onGrant, onDeny}: BackgroundLocationPermissionsFlowProps) {
    const [showFirstAskModal, setShowFirstAskModal] = useState(false);
    const [showPreciseLocationModal, setShowPreciseLocationModal] = useState(false);
    const {asset: ReceiptLocationMarker} = useMemoizedLazyAsset(() => loadIllustration('ReceiptLocationMarker'));
    const {translate} = useLocalize();

    const onModalHide = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!startPermissionsFlow) {
            return;
        }

        checkPermissions({onGrant, onDeny, onError, onAskForPermissions: () => setShowFirstAskModal(true), onPreciseLocationNotGranted: () => setShowPreciseLocationModal(true)});
        setStartPermissionsFlow(false);
    }, [startPermissionsFlow, onDeny, onGrant, setStartPermissionsFlow, onError]);

    const requestPermissionsFirstAsk = () => {
        setShowFirstAskModal(false);
        requestPermissions({
            onGrant,
            onError,
            onPreciseLocationNotGranted: () => {
                // can't trigger Precise Location modal before First Ask modal hides
                // as the animations clash and Precise Location modal doesn't show on iOS
                onModalHide.current = () => setShowPreciseLocationModal(true);
            },
        });
    };

    return (
        <>
            <ConfirmModal
                title={translate('gps.locationRequiredModal.title')}
                isVisible={showFirstAskModal}
                onConfirm={requestPermissionsFirstAsk}
                onCancel={() => {
                    setShowFirstAskModal(false);
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
                onModalHide={() => {
                    onModalHide.current?.();
                    onModalHide.current = null;
                }}
            />
            <ConfirmModal
                title={translate('gps.preciseLocationRequiredModal.title')}
                isVisible={showPreciseLocationModal}
                onConfirm={() => {
                    setShowPreciseLocationModal(false);
                    Linking.openSettings();
                }}
                onCancel={() => setShowPreciseLocationModal(false)}
                confirmText={translate('common.settings')}
                cancelText={translate('common.dismiss')}
                prompt={translate('gps.preciseLocationRequiredModal.prompt')}
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
