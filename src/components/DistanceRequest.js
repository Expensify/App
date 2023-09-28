import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashIsNil from 'lodash/isNil';
import lodashIsEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../CONST';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import variables from '../styles/variables';
import * as MapboxToken from '../libs/actions/MapboxToken';
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
import * as IOUUtils from '../libs/IOUUtils';
import Button from './Button';
import DistanceMapView from './DistanceMapView';
import DraggableList from './DraggableList';
import * as Expensicons from './Icon/Expensicons';
import PendingMapView from './MapView/PendingMapView';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import transactionPropTypes from './transactionPropTypes';
import ScreenWrapper from './ScreenWrapper';
import FullPageNotFoundView from './BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from './HeaderWithBackButton';

const MAX_WAYPOINTS = 25;

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

    /* Onyx Props */
    transaction: transactionPropTypes,

    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    transactionID: '',
    report: {},
    isEditingRequest: false,
    mapboxAccessToken: {
        token: '',
    },
    transaction: {},
};

function DistanceRequest({transactionID, report, transaction, mapboxAccessToken, route, isEditingRequest, onSubmit}) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [optimisticWaypoints, setOptimisticWaypoints] = useState(null);
    const isEditing = lodashGet(route, 'path', '').includes('address');
    const reportID = lodashGet(report, 'reportID', '');
    const waypoints = useMemo(() => optimisticWaypoints || lodashGet(transaction, 'comment.waypoints', {waypoint0: {}, waypoint1: {}}), [optimisticWaypoints, transaction]);
    const waypointsList = _.keys(waypoints);
    const iouType = lodashGet(route, 'params.iouType', '');
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = _.size(waypoints);
    const numberOfPreviousWaypoints = _.size(previousWaypoints);
    const scrollViewRef = useRef(null);

    const lastWaypointIndex = numberOfWaypoints - 1;
    const isLoadingRoute = lodashGet(transaction, 'comment.isLoading', false);
    const isLoading = lodashGet(transaction, 'isLoading', false);
    const hasRouteError = !!lodashGet(transaction, 'errorFields.route');
    const hasRoute = TransactionUtils.hasRoute(transaction);
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !_.isEqual(previousValidatedWaypoints, validatedWaypoints);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const shouldFetchRoute = (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && _.size(validatedWaypoints) > 1;
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

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        const transactionWaypoints = lodashGet(transaction, 'comment.waypoints', {});
        if (!transactionID || !_.isEmpty(transactionWaypoints)) {
            return;
        }

        // Create the initial start and stop waypoints
        Transaction.createInitialWaypoints(transactionID);
    }, [transaction, transactionID]);

    useEffect(() => {
        if (isOffline || !shouldFetchRoute) {
            return;
        }

        Transaction.getRoute(transactionID, validatedWaypoints);
    }, [shouldFetchRoute, transactionID, validatedWaypoints, isOffline]);

    useEffect(() => {
        if (numberOfWaypoints <= numberOfPreviousWaypoints) {
            return;
        }
        scrollViewRef.current.scrollToEnd({animated: true});
    }, [numberOfPreviousWaypoints, numberOfWaypoints]);

    const navigateBack = () => {
        Navigation.goBack(isEditing ? ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID) : ROUTES.HOME);
    };

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param {Number} index of the waypoint to edit
     */
    const navigateToWaypointEditPage = (index) => {
        Navigation.navigate(isEditingRequest ? ROUTES.MONEY_REQUEST_EDIT_WAYPOINT.getRoute(report.reportID, transactionID, index) : ROUTES.MONEY_REQUEST_WAYPOINT.getRoute('request', index));
    };

    const updateWaypoints = useCallback(
        ({data}) => {
            if (_.isEqual(waypointsList, data)) {
                return;
            }

            const newWaypoints = {};
            _.each(data, (waypoint, index) => {
                const newWaypoint = lodashGet(waypoints, waypoint, {});
                newWaypoints[`waypoint${index}`] = lodashIsEmpty(newWaypoint) ? null : newWaypoint;
            });

            setOptimisticWaypoints(newWaypoints);
            // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
            Transaction.updateWaypoints(transactionID, newWaypoints).then(() => {
                setOptimisticWaypoints(null);
            });
        },
        [transactionID, waypoints, waypointsList],
    );

    const renderItem = ({item, drag, getIndex, isActive}) => {
        const index = getIndex();
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
                onPress={() => navigateToWaypointEditPage(index)}
                onSecondaryInteraction={drag}
                focused={isActive}
                key={item}
                disabled={isLoadingRoute}
            />
        );
    };

    const footer = (
        <>
            {hasRouteError && (
                <DotIndicatorMessage
                    style={[styles.mh5, styles.mv3]}
                    messages={ErrorUtils.getLatestErrorField(transaction, 'route')}
                    type="error"
                />
            )}
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
                            location: CONST.MAPBOX.DEFAULT_COORDINATE,
                        }}
                        directionCoordinates={lodashGet(transaction, 'routes.route0.geometry.coordinates', [])}
                        style={styles.mapView}
                        waypoints={waypointMarkers}
                        styleURL={CONST.MAPBOX.STYLE_URL}
                        overlayStyle={styles.m4}
                    />
                ) : (
                    <PendingMapView
                        title={translate('distance.mapPending.title')}
                        subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                    />
                )}
            </View>
        </>
    );

    const content = (
        <>
            <View style={styles.flex1}>
                <DraggableList
                    data={waypointsList}
                    keyExtractor={(item) => item}
                    shouldUsePortal
                    onDragEnd={updateWaypoints}
                    scrollEventThrottle={variables.distanceScrollEventThrottle}
                    ref={scrollViewRef}
                    renderItem={renderItem}
                    ListFooterComponent={footer}
                />
            </View>
            <View style={[styles.w100, styles.pt2]}>
                <Button
                    success
                    style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                    onPress={() => onSubmit(waypoints)}
                    isDisabled={_.size(validatedWaypoints) < 2 || (!isOffline && (hasRouteError || isLoadingRoute || isLoading))}
                    text={translate(isEditingRequest ? 'common.save' : 'common.next')}
                    isLoading={!isOffline && (isLoadingRoute || shouldFetchRoute || isLoading)}
                />
            </View>
        </>
    );

    if (!isEditing) {
        return content;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            testID={DistanceRequest.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('common.distance')}
                            onBackButtonPress={navigateBack}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(DistanceRequest);
