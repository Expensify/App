import lodashGet from 'lodash/get';
import lodashIsNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as MapboxToken from '@userActions/MapboxToken';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import DistanceMapView from './DistanceMapView';
import * as Expensicons from './Icon/Expensicons';
import ImageSVG from './ImageSVG';
import PendingMapView from './MapView/PendingMapView';
import transactionPropTypes from './transactionPropTypes';

const propTypes = {
    /** Transaction that stores the distance request data */
    transaction: transactionPropTypes,

    /** Data about Mapbox token for calling Mapbox API */
    mapboxAccessToken: PropTypes.shape({
        /** Temporary token for Mapbox API */
        token: PropTypes.string,

        /** Time when the token will expire in ISO 8601 */
        expiration: PropTypes.string,
    }),
};

const defaultProps = {
    transaction: {},
    mapboxAccessToken: {
        token: '',
    },
};

function ConfirmedRoute({mapboxAccessToken, transaction}) {
    const {isOffline} = useNetwork();
    const {route0: route} = transaction.routes || {};
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const coordinates = lodashGet(route, 'geometry.coordinates', []);
    const theme = useTheme();
    const styles = useThemeStyles();

    const getWaypointMarkers = useCallback(
        (waypointsData) => {
            const numberOfWaypoints = _.size(waypointsData);
            const lastWaypointIndex = numberOfWaypoints - 1;

            return _.filter(
                _.map(waypointsData, (waypoint, key) => {
                    if (!waypoint || lodashIsNil(waypoint.lat) || lodashIsNil(waypoint.lng)) {
                        return;
                    }

                    const index = TransactionUtils.getWaypointIndex(key);
                    let MarkerComponent;
                    if (index === 0) {
                        MarkerComponent = Expensicons.DotIndicatorUnfilled;
                    } else if (index === lastWaypointIndex) {
                        MarkerComponent = Expensicons.Location;
                    } else {
                        MarkerComponent = Expensicons.DotIndicator;
                    }

                    return {
                        id: `${waypoint.lng},${waypoint.lat},${index}`,
                        coordinate: [waypoint.lng, waypoint.lat],
                        markerComponent: () => (
                            <ImageSVG
                                src={MarkerComponent}
                                width={CONST.MAP_MARKER_SIZE}
                                height={CONST.MAP_MARKER_SIZE}
                                fill={theme.icon}
                            />
                        ),
                    };
                }),
                (waypoint) => waypoint,
            );
        },
        [theme],
    );

    const waypointMarkers = getWaypointMarkers(waypoints);

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    return (
        <>
            {!isOffline && Boolean(mapboxAccessToken.token) ? (
                <DistanceMapView
                    accessToken={mapboxAccessToken.token}
                    mapPadding={CONST.MAP_PADDING}
                    pitchEnabled={false}
                    initialState={{
                        zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                        location: lodashGet(waypointMarkers, [0, 'coordinate'], CONST.MAPBOX.DEFAULT_COORDINATE),
                    }}
                    directionCoordinates={coordinates}
                    style={[styles.mapView, styles.br4]}
                    waypoints={waypointMarkers}
                    styleURL={CONST.MAPBOX.STYLE_URL}
                />
            ) : (
                <PendingMapView />
            )}
        </>
    );
}

export default withOnyx({
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(ConfirmedRoute);

ConfirmedRoute.displayName = 'ConfirmedRoute';
ConfirmedRoute.propTypes = propTypes;
ConfirmedRoute.defaultProps = defaultProps;
