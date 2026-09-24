import LocationPermissionModal from '@components/LocationPermissionModal';

import useOnyx from '@hooks/useOnyx';

import {snapshotUserLocation} from '@libs/actions/UserLocation';

import {updateLastLocationPermissionPrompt} from '@userActions/IOU/MoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';

import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import React, {useEffect, useState} from 'react';

type ScanLocationSnapshotProps = {
    /** Whether a receipt captured on this screen submits without an amount, which is the case that wants coordinates attached. */
    shouldAttachLocation: boolean;
};

/**
 * Warms the location cache the moment the scan screen opens, and asks for location permission here while the prompt
 * window allows it, so neither the capture nor the submit has to wait on a permission answer or on the device.
 *
 * The position read is never awaited: a slow device leaves the cache empty and the submit falls back to its own capped
 * read, rather than slowing the shutter down.
 */
function ScanLocationSnapshot({shouldAttachLocation}: ScanLocationSnapshotProps) {
    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {selector: shouldStartLocationPermissionFlowSelector});
    const [startPermissionFlow, setStartPermissionFlow] = useState(false);

    useEffect(() => {
        if (!shouldAttachLocation) {
            return;
        }

        let stale = false;
        snapshotUserLocation(() => stale).then((permissionGranted) => {
            if (stale || permissionGranted || !shouldStartLocationPermissionFlow) {
                return;
            }
            setStartPermissionFlow(true);
        });

        return () => {
            stale = true;
        };
    }, [shouldAttachLocation, shouldStartLocationPermissionFlow]);

    if (!startPermissionFlow) {
        return null;
    }

    return (
        <LocationPermissionModal
            startPermissionFlow={startPermissionFlow}
            resetPermissionFlow={() => setStartPermissionFlow(false)}
            onGrant={() => {
                snapshotUserLocation();
            }}
            onDeny={(wasUserInitiated) => {
                if (!wasUserInitiated) {
                    return;
                }
                updateLastLocationPermissionPrompt();
            }}
        />
    );
}

ScanLocationSnapshot.displayName = 'ScanLocationSnapshot';

export default ScanLocationSnapshot;
