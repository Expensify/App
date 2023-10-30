import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashIsNil from 'lodash/isNil';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as MapboxToken from '../libs/actions/MapboxToken';
import * as TransactionUtils from '../libs/TransactionUtils';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';
import PendingMapView from './MapView/PendingMapView';
import useNetwork from '../hooks/useNetwork';
import DistanceMapView from './DistanceMapView';

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

const getWaypointMarkers = (waypoints) => {
    const numberOfWaypoints = _.size(waypoints);
    const lastWaypointIndex = numberOfWaypoints - 1;
    return _.filter(
        _.map(waypoints, (waypoint, key) => {
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
                    <MarkerComponent
                        width={CONST.MAP_MARKER_SIZE}
                        height={CONST.MAP_MARKER_SIZE}
                        fill={theme.icon}
                    />
                ),
            };
        }),
        (waypoint) => waypoint,
    );
};

function ConfirmedRoute({mapboxAccessToken, transaction}) {
    const {isOffline} = useNetwork();
    const {route0: route} = transaction.routes || {};
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const coordinates = lodashGet(route, 'geometry.coordinates', []);
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
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(ConfirmedRoute);

ConfirmedRoute.displayName = 'ConfirmedRoute';
ConfirmedRoute.propTypes = propTypes;
ConfirmedRoute.defaultProps = defaultProps;
