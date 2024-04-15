import {isEmpty, isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import type {RenderItemParams} from 'react-native-draggable-flatlist/lib/typescript/types';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DistanceRequestFooter from '@components/DistanceRequest/DistanceRequestFooter';
import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DraggableList from '@components/DraggableList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import * as MapboxToken from '@userActions/MapboxToken';
import * as TransactionAction from '@userActions/Transaction';
import * as TransactionEdit from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceOnyxProps = {
    /** backup version of the original transaction  */
    transactionBackup: OnyxEntry<OnyxTypes.Transaction>;
};

type IOURequestStepDistanceProps = IOURequestStepDistanceOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<OnyxTypes.Transaction>;
    };

function IOURequestStepDistance({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo},
    },
    transaction,
    transactionBackup,
}: IOURequestStepDistanceProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [optimisticWaypoints, setOptimisticWaypoints] = useState<WaypointCollection | null>(null);
    const waypoints = useMemo(() => optimisticWaypoints ?? transaction?.comment?.waypoints ?? {waypoint0: {}, waypoint1: {}}, [optimisticWaypoints, transaction]);
    const waypointsList = Object.keys(waypoints);
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = Object.keys(waypoints).length;
    const numberOfPreviousWaypoints = Object.keys(previousWaypoints).length;
    const scrollViewRef = useRef<RNScrollView>(null);
    const isLoadingRoute = transaction?.comment?.isLoading ?? false;
    const isLoading = transaction?.isLoading ?? false;
    const hasRouteError = !!transaction?.errorFields?.route;
    const hasRoute = TransactionUtils.hasRoute(transaction);
    const validatedWaypoints = TransactionUtils.getValidWaypoints(waypoints);
    const previousValidatedWaypoints = usePrevious(validatedWaypoints);
    const haveValidatedWaypointsChanged = !isEqual(previousValidatedWaypoints, validatedWaypoints);
    const isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    const shouldFetchRoute = (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && Object.keys(validatedWaypoints).length > 1;
    const [shouldShowAtLeastTwoDifferentWaypointsError, setShouldShowAtLeastTwoDifferentWaypointsError] = useState(false);
    const nonEmptyWaypointsCount = useMemo(() => Object.keys(waypoints).filter((key) => !isEmpty(waypoints[key])).length, [waypoints]);
    const duplicateWaypointsError = useMemo(
        () => nonEmptyWaypointsCount >= 2 && Object.keys(validatedWaypoints).length !== nonEmptyWaypointsCount,
        [nonEmptyWaypointsCount, validatedWaypoints],
    );
    const atLeastTwoDifferentWaypointsError = useMemo(() => Object.keys(validatedWaypoints).length < 2, [validatedWaypoints]);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const transactionWasSaved = useRef(false);
    const isCreatingNewRequest = !(backTo || isEditing);

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    useEffect(() => {
        if (isOffline || !shouldFetchRoute) {
            return;
        }
        TransactionAction.getRoute(transactionID, validatedWaypoints, action === CONST.IOU.ACTION.CREATE);
    }, [shouldFetchRoute, transactionID, validatedWaypoints, isOffline, action]);

    useEffect(() => {
        if (numberOfWaypoints <= numberOfPreviousWaypoints) {
            return;
        }
        scrollViewRef.current?.scrollToEnd({animated: true});
    }, [numberOfPreviousWaypoints, numberOfWaypoints]);

    useEffect(() => {
        if (nonEmptyWaypointsCount >= 2 && (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError || isLoadingRoute || isLoading)) {
            return;
        }
        setShouldShowAtLeastTwoDifferentWaypointsError(false);
    }, [atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, isLoading, isLoadingRoute, nonEmptyWaypointsCount, transaction]);

    // This effect runs when the component is mounted and unmounted. It's purpose is to be able to properly
    // discard changes if the user cancels out of making any changes. This is accomplished by backing up the
    // original transaction, letting the user modify the current transaction, and then if the user ever
    // cancels out of the modal without saving changes, the original transaction is restored from the backup.
    useEffect(() => {
        if (isCreatingNewRequest) {
            return () => {};
        }

        // On mount, create the backup transaction.
        TransactionEdit.createBackupTransaction(transaction);

        return () => {
            // If the user cancels out of the modal without without saving changes, then the original transaction
            // needs to be restored from the backup so that all changes are removed.
            if (transactionWasSaved.current) {
                return;
            }
            TransactionEdit.restoreOriginalTransactionFromBackup(transaction?.transactionID ?? '', action === CONST.IOU.ACTION.CREATE);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param index of the waypoint to edit
     */
    const navigateToWaypointEditPage = useCallback(
        (index: number) => {
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(action, CONST.IOU.TYPE.REQUEST, transactionID, report?.reportID, index.toString(), Navigation.getActiveRouteWithoutParams()),
            );
        },
        [action, transactionID, report?.reportID],
    );

    const navigateToNextStep = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report?.reportID) {
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
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
            return {duplicateWaypointsError: translate('iou.error.duplicateWaypointsErrorMessage')} as Errors;
        }
        if (atLeastTwoDifferentWaypointsError) {
            return {atLeastTwoDifferentWaypointsError: 'iou.error.atLeastTwoDifferentWaypoints'} as Errors;
        }
        return {};
    };

    type DataParams = {
        data: string[];
    };

    const updateWaypoints = useCallback(
        ({data}: DataParams) => {
            if (isEqual(waypointsList, data)) {
                return;
            }

            const newWaypoints: WaypointCollection = {};
            let emptyWaypointIndex = -1;
            data.forEach((waypoint, index) => {
                newWaypoints[`waypoint${index}`] = waypoints[waypoint] ?? {};
                // Find waypoint that BECOMES empty after dragging
                if (isEmpty(newWaypoints[`waypoint${index}`]) && !isEmpty(waypoints[`waypoint${index}`] ?? {})) {
                    emptyWaypointIndex = index;
                }
            });

            setOptimisticWaypoints(newWaypoints);
            Promise.all([
                TransactionAction.removeWaypoint(transaction, emptyWaypointIndex.toString(), action === CONST.IOU.ACTION.CREATE),
                TransactionAction.updateWaypoints(transactionID, newWaypoints, action === CONST.IOU.ACTION.CREATE),
            ]).then(() => {
                setOptimisticWaypoints(null);
            });
        },
        [transactionID, transaction, waypoints, waypointsList, action],
    );

    const submitWaypoints = useCallback(() => {
        // If there is any error or loading state, don't let user go to next page.
        if (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError || isLoadingRoute || (!isEditing && isLoading)) {
            setShouldShowAtLeastTwoDifferentWaypointsError(true);
            return;
        }
        if (!isCreatingNewRequest) {
            transactionWasSaved.current = true;
        }
        if (isEditing) {
            // If nothing was changed, simply go to transaction thread
            // We compare only addresses because numbers are rounded while backup
            const oldWaypoints = transactionBackup?.comment.waypoints ?? {};
            const oldAddresses = Object.fromEntries(Object.entries(oldWaypoints).map(([key, waypoint]) => [key, 'address' in waypoint ? waypoint.address : {}]));
            const addresses = Object.fromEntries(Object.entries(waypoints).map(([key, waypoint]) => [key, 'address' in waypoint ? waypoint.address : {}]));
            if (isEqual(oldAddresses, addresses)) {
                Navigation.dismissModal();
                return;
            }
            IOU.updateMoneyRequestDistance({transactionID: transaction?.transactionID ?? '', transactionThreadReportID: report?.reportID ?? '', waypoints});
            Navigation.dismissModal();
            return;
        }

        navigateToNextStep();
    }, [
        duplicateWaypointsError,
        atLeastTwoDifferentWaypointsError,
        hasRouteError,
        isLoadingRoute,
        isLoading,
        isCreatingNewRequest,
        isEditing,
        navigateToNextStep,
        transactionBackup,
        waypoints,
        transaction?.transactionID,
        report?.reportID,
    ]);

    const renderItem = useCallback(
        ({item, drag, isActive, getIndex}: RenderItemParams<string>) => (
            <DistanceRequestRenderItem
                waypoints={waypoints}
                item={item}
                onSecondaryInteraction={drag}
                isActive={isActive}
                getIndex={getIndex}
                onPress={navigateToWaypointEditPage}
                disabled={isLoadingRoute}
            />
        ),
        [isLoadingRoute, navigateToWaypointEditPage, waypoints],
    );

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
                        ref={scrollViewRef}
                        renderItem={renderItem}
                        ListFooterComponent={
                            <DistanceRequestFooter
                                waypoints={waypoints}
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

export default withWritableReportOrNotFound(
    withFullTransactionOrNotFound(
        withOnyx<IOURequestStepDistanceProps, IOURequestStepDistanceOnyxProps>({
            transactionBackup: {
                key: ({route}) => {
                    const transactionID = route.params.transactionID ?? 0;
                    return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`;
                },
            },
        })(IOURequestStepDistance),
    ),
);
