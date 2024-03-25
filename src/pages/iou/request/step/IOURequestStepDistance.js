import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import DistanceRequestFooter from '@components/DistanceRequest/DistanceRequestFooter';
import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DraggableList from '@components/DraggableList';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import reportPropTypes from '@pages/reportPropTypes';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as MapboxToken from '@userActions/MapboxToken';
import * as Transaction from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report that the transaction belongs to */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,

    /** backup version of the original transaction  */
    transactionBackup: transactionPropTypes,
};

const defaultProps = {
    report: {},
    transaction: {},
    transactionBackup: {},
};

function IOURequestStepDistance({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
    },
    transaction,
    transactionBackup,
}) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [optimisticWaypoints, setOptimisticWaypoints] = useState(null);
    const waypoints = useMemo(() => optimisticWaypoints || lodashGet(transaction, 'comment.waypoints', {waypoint0: {}, waypoint1: {}}), [optimisticWaypoints, transaction]);
    const waypointsList = _.keys(waypoints);
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = _.size(waypoints);
    const numberOfPreviousWaypoints = _.size(previousWaypoints);
    const scrollViewRef = useRef(null);
    const isLoadingRoute = lodashGet(transaction, 'comment.isLoading', false);
    const isLoading = lodashGet(transaction, 'isLoading', false);
    const hasRouteError = !!lodashGet(transaction, 'errorFields.route');
    const hasRoute = TransactionUtils.hasRoute(transaction);
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !_.isEqual(previousValidatedWaypoints, validatedWaypoints);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const shouldFetchRoute = (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && _.size(validatedWaypoints) > 1;
    const [shouldShowAtLeastTwoDifferentWaypointsError, setShouldShowAtLeastTwoDifferentWaypointsError] = useState(false);
    const nonEmptyWaypointsCount = useMemo(() => _.filter(_.keys(waypoints), (key) => !_.isEmpty(waypoints[key])).length, [waypoints]);
    const duplicateWaypointsError = useMemo(() => nonEmptyWaypointsCount >= 2 && _.size(validatedWaypoints) !== nonEmptyWaypointsCount, [nonEmptyWaypointsCount, validatedWaypoints]);
    const atLeastTwoDifferentWaypointsError = useMemo(() => _.size(validatedWaypoints) < 2, [validatedWaypoints]);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = Navigation.getActiveRoute().includes('start');

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        if (isOffline || !shouldFetchRoute) {
            return;
        }
        Transaction.getRoute(transactionID, validatedWaypoints, action === CONST.IOU.ACTION.CREATE);
    }, [shouldFetchRoute, transactionID, validatedWaypoints, isOffline, action]);

    useEffect(() => {
        if (numberOfWaypoints <= numberOfPreviousWaypoints) {
            return;
        }
        scrollViewRef.current.scrollToEnd({animated: true});
    }, [numberOfPreviousWaypoints, numberOfWaypoints]);

    useEffect(() => {
        if (nonEmptyWaypointsCount >= 2 && (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError || isLoadingRoute || isLoading)) {
            return;
        }
        setShouldShowAtLeastTwoDifferentWaypointsError(false);
    }, [atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, isLoading, isLoadingRoute, nonEmptyWaypointsCount, transaction]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param {Number} index of the waypoint to edit
     */
    const navigateToWaypointEditPage = (index) => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(action, CONST.IOU.TYPE.REQUEST, transactionID, report.reportID, index, Navigation.getActiveRouteWithoutParams()));
    };

    const navigateToNextStep = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    }, [report, iouType, reportID, transactionID, backTo]);

    const getError = () => {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return ErrorUtils.getLatestErrorField(transaction, 'route');
        }
        if (duplicateWaypointsError) {
            return {0: translate('iou.error.duplicateWaypointsErrorMessage')};
        }
        if (atLeastTwoDifferentWaypointsError) {
            return {0: 'iou.error.atLeastTwoDifferentWaypoints'};
        }
    };

    const updateWaypoints = useCallback(
        ({data}) => {
            if (_.isEqual(waypointsList, data)) {
                return;
            }

            const newWaypoints = {};
            let emptyWaypointIndex = -1;
            _.each(data, (waypoint, index) => {
                newWaypoints[`waypoint${index}`] = lodashGet(waypoints, waypoint, {});
                // Find waypoint that BECOMES empty after dragging
                if (_.isEmpty(newWaypoints[`waypoint${index}`]) && !_.isEmpty(lodashGet(waypoints, `waypoint${index}`, {}))) {
                    emptyWaypointIndex = index;
                }
            });

            setOptimisticWaypoints(newWaypoints);
            // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
            Promise.all([
                Transaction.removeWaypoint(transaction, emptyWaypointIndex.toString(), action === CONST.IOU.ACTION.CREATE),
                Transaction.updateWaypoints(transactionID, newWaypoints, action === CONST.IOU.ACTION.CREATE),
            ]).then(() => {
                setOptimisticWaypoints(undefined);
            });
        },
        [transactionID, transaction, waypoints, waypointsList, action],
    );

    const submitWaypoints = useCallback(() => {
        // If there is any error or loading state, don't let user go to next page.
        if (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError || isLoadingRoute || isLoading) {
            setShouldShowAtLeastTwoDifferentWaypointsError(true);
            return;
        }
        if (isEditing) {
            // If nothing was changed, simply go to transaction thread
            // We compare only addresses because numbers are rounded while backup
            const oldWaypoints = lodashGet(transactionBackup, 'comment.waypoints', {});
            const oldAddresses = _.mapObject(oldWaypoints, (waypoint) => _.pick(waypoint, 'address'));
            const addresses = _.mapObject(waypoints, (waypoint) => _.pick(waypoint, 'address'));
            if (_.isEqual(oldAddresses, addresses)) {
                Navigation.dismissModal(report.reportID);
                return;
            }
            IOU.updateMoneyRequestDistance(transaction.transactionID, report.reportID, waypoints);
            Navigation.dismissModal(report.reportID);
            return;
        }

        navigateToNextStep();
    }, [
        duplicateWaypointsError,
        atLeastTwoDifferentWaypointsError,
        hasRouteError,
        isLoadingRoute,
        isLoading,
        isEditing,
        navigateToNextStep,
        transactionBackup,
        waypoints,
        transaction.transactionID,
        report.reportID,
    ]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistance.displayName}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <>
                <View style={styles.flex1}>
                    <DraggableList
                        data={waypointsList}
                        keyExtractor={(item) => item}
                        shouldUsePortal
                        onDragEnd={updateWaypoints}
                        scrollEventThrottle={variables.distanceScrollEventThrottle}
                        ref={scrollViewRef}
                        renderItem={({item, drag, isActive, getIndex}) => (
                            <DistanceRequestRenderItem
                                waypoints={waypoints}
                                item={item}
                                onSecondaryInteraction={drag}
                                isActive={isActive}
                                getIndex={getIndex}
                                onPress={navigateToWaypointEditPage}
                                disabled={isLoadingRoute}
                            />
                        )}
                        ListFooterComponent={
                            <DistanceRequestFooter
                                waypoints={waypoints}
                                hasRouteError={hasRouteError}
                                navigateToWaypointEditPage={navigateToWaypointEditPage}
                                transaction={transaction}
                            />
                        }
                    />
                </View>
                <View style={[styles.w100, styles.pt2]}>
                    {/* Show error message if there is route error or there are less than 2 routes and user has tried submitting, */}
                    {((shouldShowAtLeastTwoDifferentWaypointsError && atLeastTwoDifferentWaypointsError) || duplicateWaypointsError || hasRouteError) && (
                        <DotIndicatorMessage
                            style={[styles.mh4, styles.mv3]}
                            messages={getError()}
                            type="error"
                        />
                    )}
                    <Button
                        success
                        allowBubble
                        pressOnEnter
                        large
                        style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                        onPress={submitWaypoints}
                        text={translate(!isCreatingNewRequest ? 'common.save' : 'common.next')}
                        isLoading={!isOffline && (isLoadingRoute || shouldFetchRoute || isLoading)}
                    />
                </View>
            </>
        </StepScreenWrapper>
    );
}

IOURequestStepDistance.displayName = 'IOURequestStepDistance';
IOURequestStepDistance.propTypes = propTypes;
IOURequestStepDistance.defaultProps = defaultProps;

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        transactionBackup: {
            key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${props.transactionID}`,
        },
    }),
)(IOURequestStepDistance);
