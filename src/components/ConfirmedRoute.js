import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as MapboxToken from '../libs/actions/MapboxToken';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';
import PendingMapView from './MapView/PendingMapView';
import useNetwork from '../hooks/useNetwork';
import DistanceMapView from './DistanceMapView';
import DistanceRequestUtils from '../libs/DistanceRequestUtils';

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
    const waypointMarkers = DistanceRequestUtils.getWaypointMarkers(waypoints);

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
                    style={styles.mapView}
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
