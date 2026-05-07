import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getWaypointIndex} from '@libs/TransactionUtils';
import {init as initMapboxToken, stop as stopMapboxToken} from '@userActions/MapboxToken';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import DistanceMapView from './DistanceMapView';
import ImageSVG from './ImageSVG';
import type {WayPoint} from './MapView/MapViewTypes';
import PendingMapView from './MapView/PendingMapView';

type ConfirmedRouteProps = {
    /** Transaction that stores the distance expense data */
    transaction: OnyxEntry<Transaction>;

    /** Whether the size of the route pending icon is smaller. */
    isSmallerIcon?: boolean;

    /** Whether it should have border radius */
    shouldHaveBorderRadius?: boolean;

    /** Whether it should display the Mapbox map only when the route/coordinates exist otherwise
     * it will display pending map icon */
    requireRouteToDisplayMap?: boolean;

    /** Whether the map is interactive or not */
    interactive?: boolean;
};

function ConfirmedRoute({transaction, isSmallerIcon, shouldHaveBorderRadius = true, requireRouteToDisplayMap = false, interactive}: ConfirmedRouteProps) {
    const {isOffline} = useNetwork();
    const {route0: route} = transaction?.routes ?? {};
    const waypoints = transaction?.comment?.waypoints ?? {};
    const coordinates = route?.geometry?.coordinates ?? [];
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'DotIndicatorUnfilled', 'Location']);

    const [mapboxAccessToken] = useOnyx(ONYXKEYS.MAPBOX_ACCESS_TOKEN);

    const getMarkerComponent = (icon: IconAsset): ReactNode => (
        <ImageSVG
            src={icon}
            width={CONST.MAP_MARKER_SIZE}
            height={CONST.MAP_MARKER_SIZE}
            fill={theme.icon}
        />
    );

    const lastWaypointIndex = Object.keys(waypoints).length - 1;
    const waypointMarkers: WayPoint[] = [];
    for (const [key, waypoint] of Object.entries(waypoints)) {
        if (!waypoint?.lat || !waypoint?.lng) {
            continue;
        }

        const index = getWaypointIndex(key);
        let MarkerComponent: IconAsset;
        if (index === 0) {
            MarkerComponent = expensifyIcons.DotIndicatorUnfilled;
        } else if (index === lastWaypointIndex) {
            MarkerComponent = expensifyIcons.Location;
        } else {
            MarkerComponent = expensifyIcons.DotIndicator;
        }

        waypointMarkers.push({
            id: `${waypoint.lng},${waypoint.lat},${index}`,
            coordinate: [waypoint.lng, waypoint.lat] as const,
            markerComponent: (): ReactNode => getMarkerComponent(MarkerComponent),
        });
    }

    useEffect(() => {
        initMapboxToken();
        return stopMapboxToken;
    }, []);

    const shouldDisplayMap = !requireRouteToDisplayMap || !!coordinates.length;

    return !isOffline && !!mapboxAccessToken?.token && shouldDisplayMap ? (
        <DistanceMapView
            interactive={interactive}
            accessToken={mapboxAccessToken?.token ?? ''}
            mapPadding={CONST.MAPBOX.PADDING}
            pitchEnabled={false}
            initialState={{
                zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                location: waypointMarkers?.at(0)?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE,
            }}
            directionCoordinates={coordinates as Array<[number, number]>}
            style={[styles.mapView, shouldHaveBorderRadius && styles.br4]}
            waypoints={waypointMarkers}
            styleURL={CONST.MAPBOX.STYLE_URL}
            requireRouteToDisplayMap={requireRouteToDisplayMap}
        />
    ) : (
        <PendingMapView
            isSmallerIcon={isSmallerIcon}
            style={!shouldHaveBorderRadius && StyleUtils.getBorderRadiusStyle(0)}
        />
    );
}

export default ConfirmedRoute;
