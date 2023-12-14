import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
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
};

const defaultProps = {
    report: {},
    transaction: {},
};

function IOURequestStepDistance({
    report,
    route: {
        params: {iouType, reportID, transactionID, backTo},
    },
    transaction,
}) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [optimisticWaypoints, setOptimisticWaypoints] = useState(null);
    const [hasError, setHasError] = useState(false);
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

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        if (isOffline || !shouldFetchRoute) {
            return;
        }

        Transaction.getRouteForDraft(transactionID, validatedWaypoints);
    }, [shouldFetchRoute, transactionID, validatedWaypoints, isOffline]);

    useEffect(() => {
        if (numberOfWaypoints <= numberOfPreviousWaypoints) {
            return;
        }
        scrollViewRef.current.scrollToEnd({animated: true});
    }, [numberOfPreviousWaypoints, numberOfWaypoints]);

    const navigateBack = () => {
        Navigation.goBack(backTo || ROUTES.HOME);
    };

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param {Number} index of the waypoint to edit
     */
    const navigateToWaypointEditPage = (index) => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(iouType, transactionID, reportID, index));
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

        if (_.size(validatedWaypoints) < 2) {
            return {0: translate('iou.error.atLeastTwoDifferentWaypoints')};
        }
    };

    const updateWaypoints = useCallback(
        ({data}) => {
            if (_.isEqual(waypointsList, data)) {
                return;
            }

            const newWaypoints = {};
            _.each(data, (waypoint, index) => {
                const newWaypoint = lodashGet(waypoints, waypoint, {});
                newWaypoints[`waypoint${index}`] = _.isEmpty(newWaypoint) ? null : newWaypoint;
            });

            setOptimisticWaypoints(newWaypoints);
            // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
            Transaction.updateWaypoints(transactionID, newWaypoints, true).then(() => {
                setOptimisticWaypoints(null);
            });
        },
        [transactionID, waypoints, waypointsList],
    );

    const submitWaypoints = useCallback(() => {
        // If there is any error or loading state, don't let user go to next page.
        if (_.size(validatedWaypoints) < 2 || hasRouteError || isLoadingRoute || isLoading) {
            setHasError(true);
            return;
        }
        navigateToNextStep();
    }, [setHasError, hasRouteError, isLoadingRoute, isLoading, validatedWaypoints, navigateToNextStep]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistance.displayName}
            shouldShowWrapper={Boolean(backTo)}
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
                    {((hasError && _.size(validatedWaypoints) < 2) || hasRouteError) && (
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
                        style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                        onPress={submitWaypoints}
                        text={translate('common.next')}
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

export default compose(withWritableReportOrNotFound, withFullTransactionOrNotFound)(IOURequestStepDistance);
