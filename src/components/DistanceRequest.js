import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import PropTypes from 'prop-types';
import _ from 'underscore';

import CONST from '../CONST';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';

import styles from '../styles/styles';
import variables from '../styles/variables';
import theme from '../styles/themes/default';

import transactionPropTypes from './transactionPropTypes';

import useNetwork from '../hooks/useNetwork';
import usePrevious from '../hooks/usePrevious';
import useLocalize from '../hooks/useLocalize';

import * as ErrorUtils from '../libs/ErrorUtils';
import Navigation from '../libs/Navigation/Navigation';
import * as MapboxToken from '../libs/actions/MapboxToken';
import * as Transaction from '../libs/actions/Transaction';
import * as TransactionUtils from '../libs/TransactionUtils';

import Button from './Button';
import MapView from './MapView';
import LinearGradient from './LinearGradient';
import * as Expensicons from './Icon/Expensicons';
import BlockingView from './BlockingViews/BlockingView';
import DotIndicatorMessage from './DotIndicatorMessage';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

const MAX_WAYPOINTS = 25;
const MAX_WAYPOINTS_TO_DISPLAY = 4;

const propTypes = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** Type of money request (i.e. IOU) */
    iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)),

    /** The report to which the distance request is associated */
    report: reportPropTypes,

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
    iou: {},
    iouType: '',
    report: {},
    transaction: {},
    mapboxAccessToken: {},
};

function DistanceRequest({iou, iouType, report, transaction, mapboxAccessToken}) {
    const [shouldShowGradient, setShouldShowGradient] = useState(false);
    const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
    const [scrollContentHeight, setScrollContentHeight] = useState(0);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const reportID = lodashGet(report, 'reportID', '');
    const waypoints = useMemo(() => lodashGet(transaction, 'comment.waypoints', {}), [transaction]);
    const numberOfWaypoints = _.size(waypoints);

    const lastWaypointIndex = numberOfWaypoints - 1;
    const isLoadingRoute = lodashGet(transaction, 'comment.isLoading', false);
    const hasRouteError = lodashHas(transaction, 'errorFields.route');
    const previousWaypoints = usePrevious(waypoints);
    const haveWaypointsChanged = !_.isEqual(previousWaypoints, waypoints);
    const doesRouteExist = lodashHas(transaction, 'routes.route0.geometry.coordinates');
    const shouldFetchRoute = (!doesRouteExist || haveWaypointsChanged) && !isLoadingRoute && TransactionUtils.validateWaypoints(waypoints);

    const waypointMarkers = useMemo(
        () =>
            _.filter(
                _.map(waypoints, (waypoint, key) => {
                    if (!waypoint || !lodashHas(waypoint, 'lat') || !lodashHas(waypoint, 'lng')) {
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

    // Show up to the max number of waypoints plus 1/2 of one to hint at scrolling
    const halfMenuItemHeight = Math.floor(variables.baseMenuItemHeight / 2);
    const scrollContainerMaxHeight = variables.baseMenuItemHeight * MAX_WAYPOINTS_TO_DISPLAY + halfMenuItemHeight;

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        if (!iou.transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        Transaction.createInitialWaypoints(iou.transactionID);
    }, [iou.transactionID, waypoints]);

    const updateGradientVisibility = (event = {}) => {
        // If a waypoint extends past the bottom of the visible area show the gradient, else hide it.
        const visibleAreaEnd = lodashGet(event, 'nativeEvent.contentOffset.y', 0) + scrollContainerHeight;
        setShouldShowGradient(visibleAreaEnd < scrollContentHeight);
    };

    useEffect(() => {
        if (isOffline || !shouldFetchRoute) {
            return;
        }

        Transaction.getRoute(iou.transactionID, waypoints);
    }, [shouldFetchRoute, iou.transactionID, waypoints, isOffline]);

    useEffect(updateGradientVisibility, [scrollContainerHeight, scrollContentHeight]);

    return (
        <>
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
                    onPress={() => Transaction.addStop(iou.transactionID)}
                    text={translate('distance.addStop')}
                    isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                    innerStyles={[styles.ph10]}
                />
            </View>
            <View style={styles.mapViewContainer}>
                {!isOffline && Boolean(mapboxAccessToken.token) ? (
                    <MapView
                        accessToken={mapboxAccessToken.token}
                        mapPadding={CONST.MAPBOX.PADDING}
                        pitchEnabled={false}
                        initialState={{
                            zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                            location: CONST.MAPBOX.DEFAULT_COORDINATE,
                        }}
                        directionCoordinates={lodashGet(transaction, 'routes.route0.geometry.coordinates', [])}
                        style={styles.mapView}
                        waypoints={waypointMarkers}
                        styleURL={CONST.MAPBOX.STYLE_URL}
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
            <Button
                success
                style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                onPress={() => IOU.navigateToNextPage(iou, iouType, reportID, report)}
                pressOnEnter
                isDisabled={waypointMarkers.length < 2}
                text={translate('common.next')}
            />
        </>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default withOnyx({
    transaction: {
        key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.iou.transactionID}`,
    },
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(DistanceRequest);
