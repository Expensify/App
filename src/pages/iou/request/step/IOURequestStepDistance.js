import React, {useCallback, useEffect, useMemo, useState, useRef, useContext} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
import _ from 'underscore';
import ROUTES from '../../../../ROUTES';
import styles from '../../../../styles/styles';
import variables from '../../../../styles/variables';
import * as MapboxToken from '../../../../libs/actions/MapboxToken';
import useNetwork from '../../../../hooks/useNetwork';
import useLocalize from '../../../../hooks/useLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import usePrevious from '../../../../hooks/usePrevious';
import * as Transaction from '../../../../libs/actions/Transaction';
import * as TransactionUtils from '../../../../libs/TransactionUtils';
import * as IOUUtils from '../../../../libs/IOUUtils';
import Button from '../../../../components/Button';
import DraggableList from '../../../../components/DraggableList';
import DistanceRequestFooter from '../../../../components/DistanceRequest/DistanceRequestFooter';
import DistanceRequestRenderItem from '../../../../components/DistanceRequest/DistanceRequestRenderItem';
import IOURouteContext from '../../IOURouteContext';
import CONST from '../../../../CONST';
import * as IOU from '../../../../libs/actions/IOU';
import StepScreenWrapper from './StepScreenWrapper';

const propTypes = {};

const defaultProps = {};

function IOURequestStepDistance() {
    const {
        route: {
            params: {iouType, reportID, step, transactionID},
        },
        report,
        transaction,
    } = useContext(IOURouteContext);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [optimisticWaypoints, setOptimisticWaypoints] = useState(null);
    const waypoints = useMemo(() => optimisticWaypoints || lodashGet(transaction, 'comment.waypoints', {waypoint0: {}, waypoint1: {}}), [optimisticWaypoints, transaction]);
    const waypointsList = _.keys(waypoints);
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = _.size(waypoints);
    const numberOfPreviousWaypoints = _.size(previousWaypoints);
    const scrollViewRef = useRef(null);

    // When this screen is accessed from the "start request flow" (ie. the manual/scan/distance tab selector) it is already embedded in a screen wrapper.
    // When this screen is navigated to from the "confirmation step" it won't be embedded in a screen wrapper, so the StepScreenWrapper should be shown.
    // In the "start request flow", the "step" param does not exist, but it does exist in the "confirmation step" flow.
    const isUserComingFromConfirmationStep = !_.isUndefined(step);

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
        const transactionWaypoints = lodashGet(transaction, 'comment.waypoints', {});
        if (!lodashGet(transaction, 'transactionID') || !_.isEmpty(transactionWaypoints)) {
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

    const navigateToConfirmationStep = () => {
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
    };

    const navigateBack = () => {
        if (isUserComingFromConfirmationStep) {
            // Take the user back to the confirmation step
            navigateToConfirmationStep();
            return;
        }

        Navigation.goBack(ROUTES.HOME);
    };

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param {Number} index of the waypoint to edit
     */
    const navigateToWaypointEditPage = (index) => {
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.WAYPOINT, transactionID, reportID, index));
    };

    const navigateToNextStep = () => {
        if (isUserComingFromConfirmationStep) {
            // Take the user back to the confirmation step
            navigateToConfirmationStep();
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.autoAssignParticipants(transactionID, report);
            Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.PARTICIPANTS, transactionID, reportID));
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

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistance.displayName}
            shouldShowNotFound={!IOUUtils.isValidMoneyRequestType(iouType)}
            shouldShowWrapper={isUserComingFromConfirmationStep}
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
                                transactionID={transactionID}
                            />
                        }
                    />
                </View>
                <View style={[styles.w100, styles.pt2]}>
                    <Button
                        success
                        allowBubble
                        pressOnEnter
                        style={[styles.w100, styles.mb4, styles.ph4, styles.flexShrink0]}
                        onPress={navigateToNextStep}
                        isDisabled={_.size(validatedWaypoints) < 2 || (!isOffline && (hasRouteError || isLoadingRoute || isLoading))}
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

export default IOURequestStepDistance;
