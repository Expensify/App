import React from 'react';
import PropTypes from 'prop-types';
import MapView from 'react-native-x-maps';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import lodashGet from 'lodash/get';
import * as MapboxToken from '../libs/actions/MapboxToken';
import {useEffect} from 'react';
import _ from 'underscore';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';

const MAP_PADDING = 50;

const propTypes = {
    transactionID: PropTypes.string,
    transaction: PropTypes.object,
    mapboxAccessToken: PropTypes.object,
};

const defaultProps = {
    transactionID: PropTypes.string,
    transaction: PropTypes.object,
    mapboxAccessToken: PropTypes.object,
};

function ConfirmedRoute({transaction, mapboxAccessToken}) {
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
            accessToken={mapboxAccessToken.token}
            style={{
                flex: 1,
                borderRadius: 20,
                overflow: 'hidden',
            }}
            styleURL={CONST.MAPBOX_STYLE_URL}
            waypoints={waypointMarkers}
            mapPadding={MAP_PADDING}
        />
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

ConfirmedRoute.displayName = 'MoneyRequestConfirmPage';
ConfirmedRoute.prototype = propTypes;
ConfirmedRoute.defaultProps = defaultProps;
