import React, {useEffect, useMemo, useState, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import lodashIsNull from 'lodash/isNull';
import PropTypes from 'prop-types';
import _ from 'underscore';

import CONST from '../CONST';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';

import styles from '../styles/styles';
import variables from '../styles/variables';
import LinearGradient from './LinearGradient';
import * as MapboxToken from '../libs/actions/MapboxToken';
import BlockingView from './BlockingViews/BlockingView';
import useNetwork from '../hooks/useNetwork';
import useLocalize from '../hooks/useLocalize';
import Navigation from '../libs/Navigation/Navigation';
import reportPropTypes from '../pages/reportPropTypes';
import DotIndicatorMessage from './DotIndicatorMessage';
import * as ErrorUtils from '../libs/ErrorUtils';
import usePrevious from '../hooks/usePrevious';
import theme from '../styles/themes/default';

import * as Transaction from '../libs/actions/Transaction';
import * as TransactionUtils from '../libs/TransactionUtils';

import Button from './Button';
import MapView from './MapView';
import * as Expensicons from './Icon/Expensicons';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import {iouPropTypes} from '../pages/iou/propTypes';
import * as IOU from '../libs/actions/IOU';
import * as StyleUtils from '../styles/StyleUtils';

const MAX_WAYPOINTS = 25;
const MAX_WAYPOINTS_TO_DISPLAY = 4;

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The report to which the distance request is associated */
    report: reportPropTypes,

    /** Data about Mapbox token for calling Mapbox API */
    mapboxAccessToken: PropTypes.shape({
        /** Temporary token for Mapbox API */
        token: PropTypes.string,

        /** Time when the token will expire in ISO 8601 */
        expiration: PropTypes.string,
    }),

    /** Are we editing an existing distance request, or creating a new one? */
    isEditingRequest: PropTypes.bool,

    /** Called on submit of this page */
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
    transactionID: '',
    report: {},
    isEditingRequest: false,
    mapboxAccessToken: {
        token: '',
    },
};

function DistanceRequest({transactionID, report, mapboxAccessToken, isEditingRequest, onSubmit}) {
    const [shouldShowGradient, setShouldShowGradient] = useState(false);
    const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
    const [scrollContentHeight, setScrollContentHeight] = useState(0);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const transaction = TransactionUtils.getTransaction(transactionID);
    const waypoints = useMemo(() => lodashGet(transaction, 'comment.waypoints', {}), [transaction]);
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = _.size(waypoints);
    const numberOfPreviousWaypoints = _.size(previousWaypoints);
    const scrollViewRef = useRef(null);

    const lastWaypointIndex = numberOfWaypoints - 1;
    const isLoadingRoute = lodashGet(transaction, 'comment.isLoading', false);
    const hasRouteError = lodashHas(transaction, 'errorFields.route');
    const haveWaypointsChanged = !_.isEqual(previousWaypoints, waypoints);
    const doesRouteExist = lodashHas(transaction, 'routes.route0.geometry.coordinates');
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const shouldFetchRoute = (!doesRouteExist || haveWaypointsChanged) && !isLoadingRoute && _.size(validatedWaypoints) > 1;
    const waypointMarkers = useMemo(
        () =>
            _.filter(
                _.map(waypoints, (waypoint, key) => {
                    if (!waypoint || !lodashHas(waypoint, 'lat') || !lodashHas(waypoint, 'lng') || lodashIsNull(waypoint.lat) || lodashIsNull(waypoint.lng)) {
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
    const halfMenuItemHeight = Math.floor(variables.optionRowHeight / 2);
    const scrollContainerMaxHeight = variables.optionRowHeight * MAX_WAYPOINTS_TO_DISPLAY + halfMenuItemHeight;

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
    useEffect(() => {
        if (isOffline || !shouldFetchRoute) {
            return;
        }

        Transaction.getRoute(transactionID, waypoints);
    }, [shouldFetchRoute, transactionID, validatedWaypoints, isOffline]);

    useEffect(updateGradientVisibility, [scrollContainerHeight, scrollContentHeight]);

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <View
                style={styles.distanceRequestContainer(scrollContainerMaxHeight)}
                onLayout={(event = {}) => setScrollContainerHeight(lodashGet(event, 'nativeEvent.layout.height', 0))}
            >
                <ScrollView
                    onContentSizeChange={(width, height) => {
                        if (scrollContentHeight < height && numberOfWaypoints > numberOfPreviousWaypoints) {
                            scrollViewRef.current.scrollToEnd({animated: true});
                        }
                        setScrollContentHeight(height);
                    }}
                    onScroll={updateGradientVisibility}
                    scrollEventThrottle={variables.distanceScrollEventThrottle}
                    ref={scrollViewRef}
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
                                onPress={() =>
                                    Navigation.navigate(
                                        isEditingRequest ? ROUTES.getMoneyRequestEditWaypointRoute(report.reportID, index) : ROUTES.getMoneyRequestWaypointRoute('request', index),
                                    )
                                }
                                key={key}
                            />
                        );
                    })}
                </ScrollView>
                {shouldShowGradient && (
                    <LinearGradient
                        style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0, {height: halfMenuItemHeight}]}
                        colors={[StyleUtils.getTransparentColor(theme.modalBackground), theme.modalBackground]}
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
                isLoading={transaction.isLoading}
                success
                style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                onPress={() => onSubmit(waypoints)}
                isDisabled={waypointMarkers.length < 2}
                text={translate(isEditingRequest ? 'common.save' : 'common.next')}
            />
        </ScrollView>
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
