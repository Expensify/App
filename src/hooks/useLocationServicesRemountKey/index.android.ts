import usePolling from '@hooks/usePolling';

import CONST from '@src/CONST';

import {useFocusEffect} from '@react-navigation/native';
import {hasServicesEnabledAsync} from 'expo-location';
import {useRef, useState} from 'react';

/**
 * The Mapbox SDK creates the map's location provider once per map instance and never recovers if Location services were
 * off at that moment (see https://github.com/rnmapbox/maps/issues/4106), so the map has to be recreated once they come back.
 * Android only: iOS resumes on its own.
 */
function useLocationServicesRemountKey(): number {
    const areLocationServicesEnabledRef = useRef<boolean | null>(null);
    const [remountKey, setRemountKey] = useState(0);

    useFocusEffect(() => {
        let ignore = false;
        hasServicesEnabledAsync().then((areLocationServicesEnabled) => {
            if (ignore) {
                return;
            }
            areLocationServicesEnabledRef.current = areLocationServicesEnabled;
        });

        return () => {
            ignore = true;
        };
    });

    const checkLocationServices = async () => {
        const areLocationServicesEnabled = await hasServicesEnabledAsync();
        const wereLocationServicesEnabled = areLocationServicesEnabledRef.current;
        areLocationServicesEnabledRef.current = areLocationServicesEnabled;

        // Only an off -> on transition needs a fresh map; services being on from the start does not
        if (wereLocationServicesEnabled !== false || !areLocationServicesEnabled) {
            return;
        }
        setRemountKey((key) => key + 1);
    };

    usePolling(checkLocationServices, CONST.TIMING.LOCATION_UPDATE_INTERVAL, true, CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);

    return remountKey;
}

export default useLocationServicesRemountKey;
