import Button from '@components/ButtonComposed';
import DistanceMapView from '@components/DistanceMapView';
import type {WayPoint} from '@components/MapView/MapViewTypes';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setSelectedRoute} from '@libs/actions/Transaction';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getSelectedRouteKey, getWaypointIndex, isCustomUnitRateIDForP2P} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

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

    /** Optional style for the map container */
    mapContainerStyle?: StyleProp<ViewStyle>;

    /** The state of the transaction (draft, current, etc.) used to persist route selection to the correct Onyx key */
    transactionState: TransactionState;
};

function DistanceRequestFooter({waypoints, transaction, navigateToWaypointEditPage, policy, mapContainerStyle, transactionState}: DistanceRequestFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const personalPolicy = usePolicy(personalPolicyID);
    const [mapboxAccessToken] = useOnyx(ONYXKEYS.MAPBOX_ACCESS_TOKEN);

    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const numberOfFilledWaypoints = Object.values(waypoints ?? {}).filter((waypoint) => waypoint?.address).length;
    const lastWaypointIndex = numberOfWaypoints - 1;
    const defaultMileageRate = DistanceRequestUtils.getDefaultMileageRate(policy ?? activePolicy);
    const policyCurrency = (policy ?? activePolicy ?? personalPolicy)?.outputCurrency ?? CONST.CURRENCY.USD;
    const mileageRate = isCustomUnitRateIDForP2P(transaction) ? DistanceRequestUtils.getRateForP2P(policyCurrency, transaction) : defaultMileageRate;
    const {unit} = mileageRate ?? {};
    const primaryRoute = transaction?.routes?.[CONST.TRANSACTION.DEFAULT_ROUTE_KEY];
    const alternateRoute = transaction?.routes?.[CONST.TRANSACTION.ALTERNATE_ROUTE_KEY];
    const isAlternateDirectionSelected = getSelectedRouteKey(transaction) === CONST.TRANSACTION.ALTERNATE_ROUTE_KEY;
    const handleRouteSelection = (isAlternate: boolean) => {
        if (isAlternate === isAlternateDirectionSelected) {
            return;
        }
        setSelectedRoute(
            transaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            isAlternate ? CONST.TRANSACTION.ALTERNATE_ROUTE_KEY : CONST.TRANSACTION.DEFAULT_ROUTE_KEY,
            (isAlternate ? alternateRoute : primaryRoute)?.distance ?? undefined,
            DistanceRequestUtils.getDistanceUnit(transaction, mileageRate),
            transactionState,
        );
    };

    const waypointMarkers: WayPoint[] = [];
    for (const [key, waypoint] of Object.entries(waypoints ?? {})) {
        if (!waypoint?.lat || !waypoint?.lng) {
            continue;
        }

        const index = getWaypointIndex(key);
        let markerType: MapMarkerType = 'WAYPOINT';
        if (index === 0) {
            markerType = 'START_WAYPOINT';
        } else if (index === lastWaypointIndex) {
            markerType = 'STOP_WAYPOINT';
        }

        waypointMarkers.push({
            id: `${waypoint.lng},${waypoint.lat},${index}`,
            coordinate: [waypoint.lng, waypoint.lat] as const,
            markerType,
        });
    }

    return (
        <>
            {numberOfFilledWaypoints >= 2 && (
                <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                    <Button
                        size={CONST.BUTTON_SIZE.SMALL}
                        onPress={() => navigateToWaypointEditPage(Object.keys(transaction?.comment?.waypoints ?? {}).length)}
                        isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                        innerStyles={[styles.pl10, styles.pr10]}
                    >
                        <Button.Icon src={expensifyIcons.Plus} />
                        <Button.Text>{translate('distance.addStop')}</Button.Text>
                    </Button>
                </View>
            )}
            <View style={[styles.mapViewContainer, mapContainerStyle]}>
                <DistanceMapView
                    accessToken={mapboxAccessToken?.token ?? ''}
                    mapPadding={CONST.MAPBOX.PADDING}
                    pitchEnabled={false}
                    initialState={{
                        zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                        location: waypointMarkers?.at(0)?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE,
                    }}
                    directionCoordinates={primaryRoute?.geometry?.coordinates ?? []}
                    alternateDirection={
                        alternateRoute?.geometry?.coordinates && alternateRoute?.distance
                            ? {
                                  coordinates: alternateRoute.geometry.coordinates,
                                  distanceInMeters: alternateRoute.distance,
                                  isSelected: isAlternateDirectionSelected,
                              }
                            : undefined
                    }
                    setIsAlternateDirectionSelected={handleRouteSelection}
                    style={[styles.mapView, styles.mapEditView]}
                    waypoints={waypointMarkers}
                    styleURL={CONST.MAPBOX.STYLE_URL}
                    overlayStyle={styles.mapEditView}
                    distanceInMeters={primaryRoute?.distance ?? undefined}
                    unit={unit}
                />
            </View>
        </>
    );
}

export default DistanceRequestFooter;
