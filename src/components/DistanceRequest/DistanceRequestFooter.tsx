import React, {useCallback, useMemo} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import DistanceMapView from '@components/DistanceMapView';
import ImageSVG from '@components/ImageSVG';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getDistanceInMeters, getWaypointIndex, isCustomUnitRateIDForP2P} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';

const MAX_WAYPOINTS = 25;

type DistanceRequestFooterProps = {
    /** The waypoints for the distance expense */
    waypoints?: WaypointCollection;

    /** Function to call when the user wants to add a new waypoint */
    navigateToWaypointEditPage: (index: number) => void;

    /** The transaction being interacted with */
    transaction: OnyxEntry<Transaction>;

    /** The policy */
    policy: OnyxEntry<Policy>;
};

function DistanceRequestFooter({waypoints, transaction, navigateToWaypointEditPage, policy}: DistanceRequestFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Location', 'Plus', 'DotIndicator', 'DotIndicatorUnfilled'] as const);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const personalPolicy = usePolicy(personalPolicyID);
    const [mapboxAccessToken] = useOnyx(ONYXKEYS.MAPBOX_ACCESS_TOKEN, {canBeMissing: true});

    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const numberOfFilledWaypoints = Object.values(waypoints ?? {}).filter((waypoint) => waypoint?.address).length;
    const lastWaypointIndex = numberOfWaypoints - 1;
    const defaultMileageRate = DistanceRequestUtils.getDefaultMileageRate(policy ?? activePolicy);
    const policyCurrency = (policy ?? activePolicy ?? personalPolicy)?.outputCurrency ?? CONST.CURRENCY.USD;
    const mileageRate = isCustomUnitRateIDForP2P(transaction) ? DistanceRequestUtils.getRateForP2P(policyCurrency, transaction) : defaultMileageRate;
    const {unit} = mileageRate ?? {};

    const getMarkerComponent = useCallback(
        (icon: IconAsset): ReactNode => (
            <ImageSVG
                src={icon}
                width={CONST.MAP_MARKER_SIZE}
                height={CONST.MAP_MARKER_SIZE}
                fill={theme.icon}
            />
        ),
        [theme],
    );

    const waypointMarkers = useMemo(
        () =>
            Object.entries(waypoints ?? {})
                .map(([key, waypoint]) => {
                    if (!waypoint?.lat || !waypoint?.lng) {
                        return;
                    }

                    const index = getWaypointIndex(key);
                    let MarkerComponent: IconAsset;
                    if (index === 0) {
                        MarkerComponent = icons.DotIndicatorUnfilled;
                    } else if (index === lastWaypointIndex) {
                        MarkerComponent = icons.Location;
                    } else {
                        MarkerComponent = icons.DotIndicator;
                    }

                    return {
                        id: `${waypoint.lng},${waypoint.lat},${index}`,
                        coordinate: [waypoint.lng, waypoint.lat] as const,
                        markerComponent: (): ReactNode => getMarkerComponent(MarkerComponent),
                    };
                })
                .filter((waypoint): waypoint is WayPoint => !!waypoint),
        [waypoints, lastWaypointIndex, getMarkerComponent, icons.DotIndicator, icons.DotIndicatorUnfilled, icons.Location],
    );

    return (
        <>
            {numberOfFilledWaypoints >= 2 && (
                <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                    <Button
                        small
                        icon={icons.Plus}
                        onPress={() => navigateToWaypointEditPage(Object.keys(transaction?.comment?.waypoints ?? {}).length)}
                        text={translate('distance.addStop')}
                        isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                        innerStyles={[styles.pl10, styles.pr10]}
                    />
                </View>
            )}
            <View style={styles.mapViewContainer}>
                <DistanceMapView
                    accessToken={mapboxAccessToken?.token ?? ''}
                    mapPadding={CONST.MAPBOX.PADDING}
                    pitchEnabled={false}
                    initialState={{
                        zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                        location: waypointMarkers?.at(0)?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE,
                    }}
                    directionCoordinates={(transaction?.routes?.route0?.geometry?.coordinates as Array<[number, number]>) ?? []}
                    style={[styles.mapView, styles.mapEditView]}
                    waypoints={waypointMarkers}
                    styleURL={CONST.MAPBOX.STYLE_URL}
                    overlayStyle={styles.mapEditView}
                    distanceInMeters={getDistanceInMeters(transaction, undefined)}
                    unit={unit}
                />
            </View>
        </>
    );
}

export default DistanceRequestFooter;
