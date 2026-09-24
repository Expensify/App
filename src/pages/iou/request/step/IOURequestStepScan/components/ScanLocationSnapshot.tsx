import LocationPermissionModal from '@components/LocationPermissionModal';

import useOnyx from '@hooks/useOnyx';

import {snapshotUserLocation} from '@libs/actions/UserLocation';

import {updateLastLocationPermissionPrompt} from '@userActions/IOU/MoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';

import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import React, {useEffect, useState} from 'react';

type ScanLocationSnapshotProps = {
    gpsRequired: boolean;
};

function ScanLocationSnapshot({gpsRequired}: ScanLocationSnapshotProps) {
    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {selector: shouldStartLocationPermissionFlowSelector});
    const [startPermissionFlow, setStartPermissionFlow] = useState(false);

    useEffect(() => {
        if (!gpsRequired) {
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
    }, [gpsRequired, shouldStartLocationPermissionFlow]);

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
