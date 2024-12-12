import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import type {RenderItemParams} from 'react-native-draggable-flatlist/lib/typescript/types';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DistanceRequestFooter from '@components/DistanceRequest/DistanceRequestFooter';
import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DraggableList from '@components/DraggableList';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useFetchRoute from '@hooks/useFetchRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
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
import type {Participant} from '@src/types/onyx/IOU';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceProps = WithCurrentUserPersonalDetailsProps &
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
    currentUserPersonalDetails,
}: IOURequestStepDistanceProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID ?? -1}`);
    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`);
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [optimisticWaypoints, setOptimisticWaypoints] = useState<WaypointCollection | null>(null);
    const waypoints = useMemo(
        () =>
            optimisticWaypoints ??
            transaction?.comment?.waypoints ?? {
                waypoint0: {keyForList: 'start_waypoint'},
                waypoint1: {keyForList: 'stop_waypoint'},
            },
        [optimisticWaypoints, transaction],
    );

    const backupWaypoints = transactionBackup?.pendingFields?.waypoints ? transactionBackup?.comment?.waypoints : undefined;
    // When online, fetch the backup route to ensure the map is populated even if the user does not save the transaction.
    // Fetch the backup route first to ensure the backup transaction map is updated before the main transaction map.
    // This prevents a scenario where the main map loads, the user dismisses the map editor, and the backup map has not yet loaded due to delay.
    useFetchRoute(transactionBackup, backupWaypoints, action, CONST.TRANSACTION.STATE.BACKUP);
    const {shouldFetchRoute, validatedWaypoints} = useFetchRoute(
        transaction,
        waypoints,
        action,
        IOUUtils.shouldUseTransactionDraft(action) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT,
    );
    const waypointsList = Object.keys(waypoints);
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = Object.keys(waypoints).length;
    const numberOfPreviousWaypoints = Object.keys(previousWaypoints).length;
    const scrollViewRef = useRef<RNScrollView>(null);
    const isLoadingRoute = transaction?.comment?.isLoading ?? false;
    const isLoading = transaction?.isLoading ?? false;
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const hasRouteError = !!transaction?.errorFields?.route;
    const [shouldShowAtLeastTwoDifferentWaypointsError, setShouldShowAtLeastTwoDifferentWaypointsError] = useState(false);
    const isWaypointEmpty = (waypoint?: Waypoint) => {
        if (!waypoint) {
            return true;
        }
        const {keyForList, ...waypointWithoutKey} = waypoint;
        return isEmpty(waypointWithoutKey);
    };
    const nonEmptyWaypointsCount = useMemo(() => Object.keys(waypoints).filter((key) => !isWaypointEmpty(waypoints[key])).length, [waypoints]);

    const duplicateWaypointsError = useMemo(
        () => nonEmptyWaypointsCount >= 2 && Object.keys(validatedWaypoints).length !== nonEmptyWaypointsCount,
        [nonEmptyWaypointsCount, validatedWaypoints],
    );
    const atLeastTwoDifferentWaypointsError = useMemo(() => Object.keys(validatedWaypoints).length < 2, [validatedWaypoints]);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const transactionWasSaved = useRef(false);
    const isCreatingNewRequest = !(backTo || isEditing);
    const [recentWaypoints, {status: recentWaypointsStatus}] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const iouRequestType = TransactionUtils.getRequestType(transaction);
    const customUnitRateID = TransactionUtils.getRateID(transaction) ?? '-1';

    // Sets `amount` and `split` share data before moving to the next step to avoid briefly showing `0.00` as the split share for participants
    const setDistanceRequestData = useCallback(
        (participants: Participant[]) => {
            // Get policy report based on transaction participants
            const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
            const selectedReportID = participants?.length === 1 ? participants.at(0)?.reportID ?? reportID : reportID;
            const policyReport = participants.at(0) ? ReportUtils.getReport(selectedReportID) : report;

            const IOUpolicyID = IOU.getIOURequestPolicyID(transaction, policyReport);
            const IOUpolicy = PolicyUtils.getPolicy(report?.policyID ?? IOUpolicyID);
            const policyCurrency = policy?.outputCurrency ?? PolicyUtils.getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;

            const mileageRates = DistanceRequestUtils.getMileageRates(IOUpolicy);
            const defaultMileageRate = DistanceRequestUtils.getDefaultMileageRate(IOUpolicy);
            const mileageRate: MileageRate = TransactionUtils.isCustomUnitRateIDForP2P(transaction)
                ? DistanceRequestUtils.getRateForP2P(policyCurrency, transaction)
                : mileageRates?.[customUnitRateID] ?? defaultMileageRate;

            const {unit, rate} = mileageRate ?? {};
            const distance = TransactionUtils.getDistanceInMeters(transaction, unit);
            const currency = mileageRate?.currency ?? policyCurrency;
            const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
            IOU.setMoneyRequestAmount(transactionID, amount, currency);

            const participantAccountIDs: number[] | undefined = participants?.map((participant) => Number(participant.accountID ?? -1));
            if (isSplitRequest && amount && currency && !isPolicyExpenseChat) {
                IOU.setSplitShares(transaction, amount, currency ?? '', participantAccountIDs ?? []);
            }
        },
        [report, transaction, transactionID, isSplitRequest, policy?.outputCurrency, reportID, customUnitRateID],
    );

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return (
            iouType !== CONST.IOU.TYPE.SPLIT &&
            !ReportUtils.isArchivedRoom(report, reportNameValuePairs) &&
            !(ReportUtils.isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)))
        );
    }, [report, skipConfirmation, policy, reportNameValuePairs, iouType]);
    let buttonText = !isCreatingNewRequest ? translate('common.save') : translate('common.next');
    if (shouldSkipConfirmation) {
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            buttonText = translate('iou.split');
        } else if (iouType === CONST.IOU.TYPE.TRACK) {
            buttonText = translate('iou.trackExpense');
        } else {
            buttonText = translate('iou.submitExpense');
        }
    }

    useEffect(() => {
        if (iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE || isOffline || recentWaypointsStatus === 'loading' || recentWaypoints !== undefined) {
            return;
        }

        // Only load the recent waypoints if they have been read from Onyx as undefined
        // If the account doesn't have recent waypoints they will be returned as an empty array
        TransactionAction.openDraftDistanceExpense();
    }, [iouRequestType, recentWaypointsStatus, recentWaypoints, isOffline]);

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

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
                TransactionEdit.removeBackupTransaction(transaction?.transactionID ?? '-1');
                return;
            }
            TransactionEdit.restoreOriginalTransactionFromBackup(transaction?.transactionID ?? '-1', IOUUtils.shouldUseTransactionDraft(action));

            // If the user opens IOURequestStepDistance in offline mode and then goes online, re-open the report to fill in missing fields from the transaction backup
            if (!transaction?.reportID) {
                return;
            }
            Report.openReport(transaction?.reportID);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param index of the waypoint to edit
     */
    const navigateToWaypointEditPage = useCallback(
        (index: number) => {
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, report?.reportID ?? reportID, index.toString(), Navigation.getActiveRoute()),
            );
        },
        [action, transactionID, report?.reportID, reportID],
    );

    const navigateToParticipantPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
        }
    }, [iouType, reportID, transactionID]);

    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
        }
    }, [iouType, reportID, transactionID]);

    const navigateToNextStep = useCallback(() => {
        if (transaction?.splitShares) {
            IOU.resetSplitShares(transaction);
        }
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because either:
        // - The user started this flow from using the + button in the composer inside a report.
        // - The user started this flow from using the global create menu by selecting the Track expense option.
        // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        // If the user started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
        if (report?.reportID && !ReportUtils.isArchivedRoom(report, reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
            const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? -1;
                return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
            });
            setDistanceRequestData(participants);
            if (shouldSkipConfirmation) {
                IOU.setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
                IOU.setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);
                const participant = participants.at(0);
                if (iouType === CONST.IOU.TYPE.TRACK && participant) {
                    playSound(SOUNDS.DONE);
                    IOU.trackExpense(
                        report,
                        0,
                        transaction?.currency ?? 'USD',
                        transaction?.created ?? '',
                        translate('iou.fieldPending'),
                        currentUserPersonalDetails.login,
                        currentUserPersonalDetails.accountID,
                        participant,
                        '',
                        false,
                        {},
                        '',
                        '',
                        '',
                        0,
                        false,
                        policy,
                        undefined,
                        undefined,
                        undefined,
                        TransactionUtils.getValidWaypoints(waypoints, true),
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        customUnitRateID,
                    );
                    return;
                }

                playSound(SOUNDS.DONE);
                IOU.createDistanceRequest(
                    report,
                    participants,
                    '',
                    transaction?.created ?? '',
                    '',
                    '',
                    '',
                    0,
                    0,
                    transaction?.currency ?? 'USD',
                    translate('iou.fieldPending'),
                    !!policy?.defaultBillable,
                    TransactionUtils.getValidWaypoints(waypoints, true),
                    undefined,
                    undefined,
                    undefined,
                    DistanceRequestUtils.getCustomUnitRateID(report.reportID),
                    currentUserPersonalDetails.login ?? '',
                    currentUserPersonalDetails.accountID,
                    transaction?.splitShares,
                    iouType,
                    transaction,
                );
                return;
            }
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            navigateToConfirmationPage();
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        navigateToParticipantPage();
    }, [
        report,
        iouType,
        transactionID,
        backTo,
        waypoints,
        currentUserPersonalDetails,
        personalDetails,
        shouldSkipConfirmation,
        transaction,
        translate,
        navigateToParticipantPage,
        navigateToConfirmationPage,
        policy,
        reportNameValuePairs,
        customUnitRateID,
        setDistanceRequestData,
    ]);

    const getError = () => {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return ErrorUtils.getLatestErrorField(transaction, 'route');
        }
        if (duplicateWaypointsError) {
            return {duplicateWaypointsError: translate('iou.error.duplicateWaypointsErrorMessage')} as Errors;
        }
        if (atLeastTwoDifferentWaypointsError) {
            return {atLeastTwoDifferentWaypointsError: translate('iou.error.atLeastTwoDifferentWaypoints')} as Errors;
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
                if (isWaypointEmpty(newWaypoints[`waypoint${index}`]) && !isWaypointEmpty(waypoints[`waypoint${index}`])) {
                    emptyWaypointIndex = index;
                }
            });

            setOptimisticWaypoints(newWaypoints);
            Promise.all([
                TransactionAction.removeWaypoint(transaction, emptyWaypointIndex.toString(), IOUUtils.shouldUseTransactionDraft(action)),
                TransactionAction.updateWaypoints(transactionID, newWaypoints, IOUUtils.shouldUseTransactionDraft(action)),
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
        if (!isCreatingNewRequest && !isEditing) {
            transactionWasSaved.current = true;
        }
        if (isEditing) {
            // If nothing was changed, simply go to transaction thread
            // We compare only addresses because numbers are rounded while backup
            const oldWaypoints = transactionBackup?.comment?.waypoints ?? {};
            const oldAddresses = Object.fromEntries(Object.entries(oldWaypoints).map(([key, waypoint]) => [key, 'address' in waypoint ? waypoint.address : {}]));
            const addresses = Object.fromEntries(Object.entries(waypoints).map(([key, waypoint]) => [key, 'address' in waypoint ? waypoint.address : {}]));
            const hasRouteChanged = !isEqual(transactionBackup?.routes, transaction?.routes);
            if (isEqual(oldAddresses, addresses)) {
                navigateBack();
                return;
            }
            IOU.updateMoneyRequestDistance({
                transactionID: transaction?.transactionID ?? '-1',
                transactionThreadReportID: report?.reportID ?? '-1',
                waypoints,
                ...(hasRouteChanged ? {routes: transaction?.routes} : {}),
                policy,
            });
            transactionWasSaved.current = true;
            navigateBack();
            return;
        }

        navigateToNextStep();
    }, [
        navigateBack,
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
        transaction?.routes,
        report?.reportID,
        policy,
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
                        keyExtractor={(item) => (waypoints[item]?.keyForList ?? waypoints[item]?.address ?? '') + item}
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
                        style={[styles.w100, styles.mb5, styles.ph4, styles.flexShrink0]}
                        onPress={submitWaypoints}
                        text={buttonText}
                        isLoading={!isOffline && (isLoadingRoute || shouldFetchRoute || isLoading)}
                    />
                </View>
            </>
        </StepScreenWrapper>
    );
}

IOURequestStepDistance.displayName = 'IOURequestStepDistance';

const IOURequestStepDistanceWithOnyx = IOURequestStepDistance;

const IOURequestStepDistanceWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceWithWritableReportOrNotFound);

export default IOURequestStepDistanceWithFullTransactionOrNotFound;
