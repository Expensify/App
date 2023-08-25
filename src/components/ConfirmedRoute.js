import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import MapView from 'react-native-x-maps';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as MapboxToken from '../libs/actions/MapboxToken';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';

const MAP_PADDING = 50;

const propTypes = {
    /** Transaction that stores the distance request data */
    transaction: transactionPropTypes,

    /** Token needed to render the map */
    mapboxToken: PropTypes.string,
};

const defaultProps = {
    transaction: {},
    mapboxToken: '',
};

function ConfirmedRoute({mapboxToken, transaction}) {
    const {route0: route} = transaction.routes;
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const numberOfWaypoints = _.size(waypoints);
    const lastWaypointIndex = numberOfWaypoints - 1;
    const waypointMarkers = _.filter(
        _.map(waypoints, (waypoint, key) => {
            if (!waypoint || waypoint.lng === undefined || waypoint.lat === undefined) {
                return;
            }

            const index = Number(key.replace('waypoint', ''));
            let MarkerComponent;
            if (index === 0) {
                MarkerComponent = Expensicons.DotIndicatorUnfilled;
            } else if (index === lastWaypointIndex) {
                MarkerComponent = Expensicons.Location;
            } else {
                MarkerComponent = Expensicons.DotIndicator;
            }

            return {
                coordinate: [waypoint.lng, waypoint.lat],
                markerComponent: () => (
                    <MarkerComponent
                        width={20}
                        height={20}
                        fill={theme.icon}
                    />
                ),
            };
        }),
        (waypoint) => waypoint,
    );

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    return (
        <MapView
            accessToken={mapboxToken}
            style={{
                flex: 1,
                borderRadius: 20,
                overflow: 'hidden',
            }}
            styleURL={CONST.MAPBOX_STYLE_URL}
            directionStyle={styles.mapDirection}
            waypoints={waypointMarkers}
            mapPadding={MAP_PADDING}
            directionCoordinates={route.geometry.coordinates}
        />
    );
}

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
    mapboxToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
        selector: (mapboxAccessToken) => mapboxAccessToken.token,
    },
})(ConfirmedRoute);

ConfirmedRoute.displayName = 'MoneyRequestConfirmPage';
ConfirmedRoute.propTypes = propTypes;
ConfirmedRoute.defaultProps = defaultProps;
