import React, {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import MapView from 'react-native-x-maps';
import ONYXKEYS from '../ONYXKEYS';
import * as Transaction from '../libs/actions/Transaction';
import * as TransactionUtils from '../libs/TransactionUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';
import Button from './Button';
import styles from '../styles/styles';
import variables from '../styles/variables';
import LinearGradient from './LinearGradient';
import * as MapboxToken from '../libs/actions/MapboxToken';
import CONST from '../CONST';
import BlockingView from './BlockingViews/BlockingView';
import useNetwork from '../hooks/useNetwork';
import useLocalize from '../hooks/useLocalize';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import transactionPropTypes from './transactionPropTypes';
import ScreenWrapper from './ScreenWrapper';
import DotIndicatorMessage from './DotIndicatorMessage';
import * as ErrorUtils from '../libs/ErrorUtils';
import usePrevious from '../hooks/usePrevious';

const MAX_WAYPOINTS = 25;
const MAX_WAYPOINTS_TO_DISPLAY = 4;

const MAP_PADDING = 50;
const DEFAULT_ZOOM_LEVEL = 10;

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The optimistic transaction for this request */
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
    transactionID: '',
    transaction: {},
    mapboxAccessToken: {},
};

function DistanceRequest({transactionID, transaction, mapboxAccessToken}) {
    const [shouldShowGradient, setShouldShowGradient] = useState(false);
    const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
    const [scrollContentHeight, setScrollContentHeight] = useState(0);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const numberOfWaypoints = _.size(waypoints);

    const lastWaypointIndex = numberOfWaypoints - 1;
    const isLoadingRoute = lodashGet(transaction, 'comment.isLoading', false);
    const hasRouteError = Boolean(lodashGet(transaction, 'errorFields.route'));
    const previousWaypoints = usePrevious(waypoints);
    const haveWaypointsChanged = !_.isEqual(previousWaypoints, waypoints);
    const shouldFetchRoute = haveWaypointsChanged && !isOffline && !isLoadingRoute && TransactionUtils.validateWaypoints(waypoints);

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

    // Show up to the max number of waypoints plus 1/2 of one to hint at scrolling
    const halfMenuItemHeight = Math.floor(variables.baseMenuItemHeight / 2);
    const scrollContainerMaxHeight = variables.baseMenuItemHeight * MAX_WAYPOINTS_TO_DISPLAY + halfMenuItemHeight;

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        if (!transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        Transaction.createInitialWaypoints(transactionID);
    }, [transactionID, waypoints]);

    const updateGradientVisibility = (event = {}) => {
        // If a waypoint extends past the bottom of the visible area show the gradient, else hide it.
        const visibleAreaEnd = lodashGet(event, 'nativeEvent.contentOffset.y', 0) + scrollContainerHeight;
        setShouldShowGradient(visibleAreaEnd < scrollContentHeight);
    };

    // Handle fetching the route when there are at least 2 waypoints
    useEffect(() => {
        if (!shouldFetchRoute) {
            return;
        }

        Transaction.getRoute(transactionID, waypoints);
    }, [shouldFetchRoute, transactionID, waypoints]);

    useEffect(updateGradientVisibility, [scrollContainerHeight, scrollContentHeight]);

    return (
        <ScreenWrapper shouldEnableMaxHeight>
            <View
                style={styles.distanceRequestContainer(scrollContainerMaxHeight)}
                onLayout={(event = {}) => setScrollContainerHeight(lodashGet(event, 'nativeEvent.layout.height', 0))}
            >
                <ScrollView
                    onContentSizeChange={(width, height) => setScrollContentHeight(height)}
                    onScroll={updateGradientVisibility}
                    scrollEventThrottle={16}
                >
                    {_.map(waypoints, (waypoint, key) => {
                        // key is of the form waypoint0, waypoint1, ...
                        const index = Number(key.replace('waypoint', ''));
                        let descriptionKey = 'distance.waypointDescription.';
                        let waypointIcon;
                        if (index === 0) {
                            descriptionKey += 'start';
                            waypointIcon = Expensicons.DotIndicatorUnfilled;
                        } else if (index === lastWaypointIndex) {
                            descriptionKey += 'finish';
                            waypointIcon = Expensicons.Location;
                        } else {
                            descriptionKey += 'stop';
                            waypointIcon = Expensicons.DotIndicator;
                        }

                        return (
                            <MenuItemWithTopDescription
                                description={translate(descriptionKey)}
                                title={lodashGet(waypoints, [`waypoint${index}`, 'address'], '')}
                                icon={Expensicons.DragHandles}
                                iconFill={theme.icon}
                                secondaryIcon={waypointIcon}
                                secondaryIconFill={theme.icon}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.getMoneyRequestWaypointRoute('request', index))}
                                key={key}
                            />
                        );
                    })}
                </ScrollView>
                {shouldShowGradient && (
                    <LinearGradient
                        style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0, {height: halfMenuItemHeight}]}
                        colors={[theme.transparent, theme.modalBackground]}
                    />
                )}
                {hasRouteError && (
                    <DotIndicatorMessage
                        style={[styles.mh5, styles.mv3]}
                        messages={ErrorUtils.getLatestErrorField(transaction, 'route')}
                        type="error"
                    />
                )}
            </View>
            <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                <Button
                    small
                    icon={Expensicons.Plus}
                    onPress={() => Transaction.addStop(transactionID)}
                    text={translate('distance.addStop')}
                    isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                    innerStyles={[styles.ph10]}
                />
            </View>
            <View style={styles.mapViewContainer}>
                {!isOffline && Boolean(mapboxAccessToken.token) ? (
                    <MapView
                        accessToken={mapboxAccessToken.token}
                        mapPadding={MAP_PADDING}
                        pitchEnabled={false}
                        initialState={{
                            location: CONST.SF_COORDINATES,
                            zoom: DEFAULT_ZOOM_LEVEL,
                        }}
                        directionCoordinates={lodashGet(transaction, 'routes.route0.geometry.coordinates', [])}
                        directionStyle={styles.mapDirection}
                        style={styles.mapView}
                        waypoints={waypointMarkers}
                        styleURL={CONST.MAPBOX_STYLE_URL}
                    />
                ) : (
                    <View style={[styles.mapPendingView]}>
                        <BlockingView
                            icon={Expensicons.EmptyStateRoutePending}
                            title={translate('distance.mapPending.title')}
                            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                            shouldShowLink={false}
                        />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default withOnyx({
    transaction: {
        key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`,
    },
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(DistanceRequest);
