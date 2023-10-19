import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashIsNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import useNetwork from '../../hooks/useNetwork';
import useLocalize from '../../hooks/useLocalize';
import theme from '../../styles/themes/default';
import * as TransactionUtils from '../../libs/TransactionUtils';
import Button from '../Button';
import DistanceMapView from '../DistanceMapView';
import * as Expensicons from '../Icon/Expensicons';
import PendingMapView from '../MapView/PendingMapView';
import transactionPropTypes from '../transactionPropTypes';

const MAX_WAYPOINTS = 25;

const propTypes = {
    /** The waypoints for the distance request */
    waypoints: PropTypes.objectOf(
        PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
            address: PropTypes.string,
        }),
    ),

    /** Function to call when the user wants to add a new waypoint */
    navigateToWaypointEditPage: PropTypes.func.isRequired,

    /** Data about Mapbox token for calling Mapbox API */
    mapboxAccessToken: PropTypes.shape({
        /** Temporary token for Mapbox API */
        token: PropTypes.string,

        /** Time when the token will expire in ISO 8601 */
        expiration: PropTypes.string,
    }),

    /* Onyx Props */
    transaction: transactionPropTypes,
};

const defaultProps = {
    waypoints: {},
    mapboxAccessToken: {
        token: '',
    },
    transaction: {},
};
function DistanceRequestFooter({waypoints, transaction, mapboxAccessToken, navigateToWaypointEditPage}) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const numberOfWaypoints = _.size(waypoints);
    const lastWaypointIndex = numberOfWaypoints - 1;

    const waypointMarkers = useMemo(
        () =>
            _.filter(
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
            ),
        [waypoints, lastWaypointIndex],
    );

    return (
        <>
            <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                <Button
                    small
                    icon={Expensicons.Plus}
                    onPress={() => navigateToWaypointEditPage(_.size(lodashGet(transaction, 'comment.waypoints', {})))}
                    text={translate('distance.addStop')}
                    isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                    innerStyles={[styles.ph10]}
                />
            </View>
            <View style={styles.mapViewContainer}>
                {!isOffline && Boolean(mapboxAccessToken.token) ? (
                    <DistanceMapView
                        accessToken={mapboxAccessToken.token}
                        mapPadding={CONST.MAPBOX.PADDING}
                        pitchEnabled={false}
                        initialState={{
                            zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                            location: lodashGet(waypointMarkers, [0, 'coordinate'], CONST.MAPBOX.DEFAULT_COORDINATE),
                        }}
                        directionCoordinates={lodashGet(transaction, 'routes.route0.geometry.coordinates', [])}
                        style={[styles.mapView, styles.mapEditView]}
                        waypoints={waypointMarkers}
                        styleURL={CONST.MAPBOX.STYLE_URL}
                        overlayStyle={styles.mapEditView}
                    />
                ) : (
                    <PendingMapView
                        title={translate('distance.mapPending.title')}
                        subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                        style={styles.mapEditView}
                    />
                )}
            </View>
        </>
    );
}

DistanceRequestFooter.displayName = 'DistanceRequestFooter';
DistanceRequestFooter.propTypes = propTypes;
DistanceRequestFooter.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(DistanceRequestFooter);
