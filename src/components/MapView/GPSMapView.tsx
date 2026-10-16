import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useLocationServicesRemountKey from '@hooks/useLocationServicesRemountKey';
import useThemeStyles from '@hooks/useThemeStyles';

import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';

import {useFocusEffect} from '@react-navigation/native';
import {getForegroundPermissionsAsync} from 'expo-location';
import {useState} from 'react';

import type {GPSMapViewProps} from './MapViewTypes';

import GPSMapViewContent from './GPSMapViewContent';
import PendingMapView from './PendingMapView';
import useAccessToken from './useAccessToken';

function GPSMapView({accessToken, ...contentProps}: GPSMapViewProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isAccessTokenReady = useAccessToken({accessToken});

    const [foregroundLocationPermissionsGranted, setForegroundLocationPermissionsGranted] = useState<boolean | null>(null);

    // Check (never request) foreground location permissions to determine if we can use the followUserLocation prop on the map camera.
    // Requesting here would trigger an OS prompt on open without a prior explicit user action, so we only read the current status.
    useFocusEffect(() => {
        if (isOffline) {
            return;
        }

        let ignore = false;
        getForegroundPermissionsAsync().then(({granted}) => {
            if (ignore) {
                return;
            }
            setForegroundLocationPermissionsGranted(granted);
        });

        return () => {
            ignore = true;
        };
    });

    // Check for foreground location permissions in case user backgrounded app and foregrounded it again
    // to ensure we have the latest permissions status in case user changed them in the settings in the meantime
    useAppFocusEvent(() => {
        if (isOffline) {
            return;
        }
        getForegroundPermissionsAsync().then(({granted}) => {
            setForegroundLocationPermissionsGranted(granted);
        });
    });

    // A map created while Location services were off never gets a location fix again, so it is recreated once they come back
    const mapInstanceKey = useLocationServicesRemountKey();

    return !isOffline && isAccessTokenReady && foregroundLocationPermissionsGranted !== null ? (
        <GPSMapViewContent
            key={mapInstanceKey}
            {...contentProps}
            foregroundLocationPermissionsGranted={foregroundLocationPermissionsGranted}
        />
    ) : (
        <PendingMapView
            title={translate('distance.mapPending.title')}
            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
            style={styles.mapEditView}
        />
    );
}

export default GPSMapView;
