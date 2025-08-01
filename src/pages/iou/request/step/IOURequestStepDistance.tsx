import {deepEqual} from 'fast-equals';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import type {RenderItemParams} from 'react-native-draggable-flatlist/lib/typescript/types';
import type {OnyxEntry} from 'react-native-onyx';
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
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    createDistanceRequest,
    getIOURequestPolicyID,
    getMoneyRequestParticipantsFromReport,
    resetSplitShares,
    setCustomUnitRateID,
    setMoneyRequestAmount,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    setSplitShares,
    trackExpense,
    updateMoneyRequestDistance,
} from '@libs/actions/IOU';
import {init, stop} from '@libs/actions/MapboxToken';
import {openReport} from '@libs/actions/Report';
import {openDraftDistanceExpense, removeWaypoint, updateWaypoints as updateWaypointsUtil} from '@libs/actions/Transaction';
import {createBackupTransaction, removeBackupTransaction, restoreOriginalTransactionFromBackup} from '@libs/actions/TransactionEdit';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {navigateToParticipantPage, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getPersonalPolicy, getPolicy, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getDistanceInMeters, getRateID, getRequestType, getValidWaypoints, hasRoute, isCustomUnitRateIDForP2P} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistance({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: false});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: false});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: false});
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
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: (val) => val?.reports});

    const backupWaypoints = transactionBackup?.pendingFields?.waypoints ? transactionBackup?.comment?.waypoints : undefined;
    // When online, fetch the backup route to ensure the map is populated even if the user does not save the transaction.
    // Fetch the backup route first to ensure the backup transaction map is updated before the main transaction map.
    // This prevents a scenario where the main map loads, the user dismisses the map editor, and the backup map has not yet loaded due to delay.
    useFetchRoute(transactionBackup, backupWaypoints, action, CONST.TRANSACTION.STATE.BACKUP);
    const {shouldFetchRoute, validatedWaypoints} = useFetchRoute(
        transaction,
        waypoints,
        action,
        shouldUseTransactionDraft(action) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT,
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
    const [recentWaypoints, {status: recentWaypointsStatus}] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS, {canBeMissing: true});
    const iouRequestType = getRequestType(transaction);
    const customUnitRateID = getRateID(transaction);

    // Sets `amount` and `split` share data before moving to the next step to avoid briefly showing `0.00` as the split share for participants
    const setDistanceRequestData = useCallback(
        (participants: Participant[]) => {
            // Get policy report based on transaction participants
            const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
            const selectedReportID = participants?.length === 1 ? (participants.at(0)?.reportID ?? reportID) : reportID;
            const policyReport = participants.at(0) ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`] : report;

            const IOUpolicyID = getIOURequestPolicyID(transaction, policyReport);
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
            // eslint-disable-next-line deprecation/deprecation
            const IOUpolicy = getPolicy(report?.policyID ?? IOUpolicyID);
            const policyCurrency = policy?.outputCurrency ?? getPersonalPolicy()?.outputCurrency ?? CONST.CURRENCY.USD;

            const mileageRates = DistanceRequestUtils.getMileageRates(IOUpolicy);
            const defaultMileageRate = DistanceRequestUtils.getDefaultMileageRate(IOUpolicy);
            const mileageRate: MileageRate | undefined = isCustomUnitRateIDForP2P(transaction)
                ? DistanceRequestUtils.getRateForP2P(policyCurrency, transaction)
                : // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  (customUnitRateID && mileageRates?.[customUnitRateID]) || defaultMileageRate;

            const {unit, rate} = mileageRate ?? {};
            const distance = getDistanceInMeters(transaction, unit);
            const currency = mileageRate?.currency ?? policyCurrency;
            const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate ?? 0);
            setMoneyRequestAmount(transactionID, amount, currency);

            const participantAccountIDs: number[] | undefined = participants?.map((participant) => Number(participant.accountID ?? CONST.DEFAULT_NUMBER_ID));
            if (isSplitRequest && amount && currency && !isPolicyExpenseChat) {
                setSplitShares(transaction, amount, currency ?? '', participantAccountIDs ?? []);
            }
        },
        [report, allReports, transaction, transactionID, isSplitRequest, policy?.outputCurrency, reportID, customUnitRateID],
    );

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return (
            iouType !== CONST.IOU.TYPE.SPLIT &&
            !isArchivedReport(reportNameValuePairs) &&
            !(isPolicyExpenseChatUtil(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)))
        );
    }, [report, skipConfirmation, policy, reportNameValuePairs, iouType]);
    let buttonText = !isCreatingNewRequest ? translate('common.save') : translate('common.next');
    if (shouldSkipConfirmation) {
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            buttonText = translate('iou.split');
        } else {
            buttonText = translate('iou.createExpense');
        }
    }

    useEffect(() => {
        if (iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE || isOffline || recentWaypointsStatus === 'loading' || recentWaypoints !== undefined) {
            return;
        }

        // Only load the recent waypoints if they have been read from Onyx as undefined
        // If the account doesn't have recent waypoints they will be returned as an empty array
        openDraftDistanceExpense();
    }, [iouRequestType, recentWaypointsStatus, recentWaypoints, isOffline]);

    useEffect(() => {
        init();
        return stop;
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
        const isDraft = shouldUseTransactionDraft(action);
        // On mount, create the backup transaction.
        createBackupTransaction(transaction, isDraft);

        return () => {
            // If the user cancels out of the modal without saving changes, then the original transaction
            // needs to be restored from the backup so that all changes are removed.
            if (transactionWasSaved.current) {
                removeBackupTransaction(transaction?.transactionID);
                return;
            }
            restoreOriginalTransactionFromBackup(transaction?.transactionID, isDraft);

            // If the user opens IOURequestStepDistance in offline mode and then goes online, re-open the report to fill in missing fields from the transaction backup
            if (!transaction?.reportID || hasRoute(transaction, true)) {
                return;
            }
            openReport(transaction?.reportID);
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

    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    }, [backToReport, iouType, reportID, transactionID]);

    const navigateToNextStep = useCallback(() => {
        if (transaction?.splitShares) {
            resetSplitShares(transaction);
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
        if (report?.reportID && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
            const selectedParticipants = getMoneyRequestParticipantsFromReport(report);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
            });
            setDistanceRequestData(participants);
            if (shouldSkipConfirmation) {
                setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
                setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);
                const participant = participants.at(0);
                if (iouType === CONST.IOU.TYPE.TRACK && participant) {
                    trackExpense({
                        report,
                        isDraftPolicy: false,
                        participantParams: {
                            payeeEmail: currentUserPersonalDetails.login,
                            payeeAccountID: currentUserPersonalDetails.accountID,
                            participant,
                        },
                        policyParams: {
                            policy,
                        },
                        transactionParams: {
                            amount: 0,
                            currency: transaction?.currency ?? 'USD',
                            created: transaction?.created ?? '',
                            merchant: translate('iou.fieldPending'),
                            receipt: {},
                            billable: false,
                            validWaypoints: getValidWaypoints(waypoints, true),
                            customUnitRateID,
                            attendees: transaction?.comment?.attendees,
                        },
                    });
                    return;
                }

                createDistanceRequest({
                    report,
                    participants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    iouType,
                    existingTransaction: transaction,
                    transactionParams: {
                        amount: 0,
                        comment: '',
                        created: transaction?.created ?? '',
                        currency: transaction?.currency ?? 'USD',
                        merchant: translate('iou.fieldPending'),
                        billable: !!policy?.defaultBillable,
                        validWaypoints: getValidWaypoints(waypoints, true),
                        customUnitRateID: DistanceRequestUtils.getCustomUnitRateID(report.reportID),
                        splitShares: transaction?.splitShares,
                        attendees: transaction?.comment?.attendees,
                    },
                    backToReport,
                });
                return;
            }
            setMoneyRequestParticipantsFromReport(transactionID, report).then(() => {
                navigateToConfirmationPage();
            });
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        if (iouType === CONST.IOU.TYPE.CREATE && isPaidGroupPolicy(activePolicy) && activePolicy?.isPolicyExpenseChatEnabled && !shouldRestrictUserBillableActions(activePolicy.id)) {
            const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, activePolicy?.id);
            const rateID = DistanceRequestUtils.getCustomUnitRateID(activePolicyExpenseChat?.reportID);
            setCustomUnitRateID(transactionID, rateID);
            setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat).then(() => {
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                        transactionID,
                        activePolicyExpenseChat?.reportID,
                    ),
                );
            });
        } else {
            navigateToParticipantPage(iouType, transactionID, reportID);
        }
    }, [
        transaction,
        backTo,
        report,
        reportNameValuePairs,
        iouType,
        activePolicy,
        setDistanceRequestData,
        shouldSkipConfirmation,
        transactionID,
        personalDetails,
        reportAttributesDerived,
        translate,
        currentUserPersonalDetails.login,
        currentUserPersonalDetails.accountID,
        policy,
        waypoints,
        backToReport,
        customUnitRateID,
        navigateToConfirmationPage,
        reportID,
    ]);

    const getError = () => {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return getLatestErrorField(transaction, 'route');
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
            if (deepEqual(waypointsList, data)) {
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
                removeWaypoint(transaction, emptyWaypointIndex.toString(), shouldUseTransactionDraft(action)),
                updateWaypointsUtil(transactionID, newWaypoints, shouldUseTransactionDraft(action)),
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
            const hasRouteChanged = !deepEqual(transactionBackup?.routes, transaction?.routes);
            if (deepEqual(oldAddresses, addresses)) {
                navigateBack();
                return;
            }
            if (transaction?.transactionID && report?.reportID) {
                updateMoneyRequestDistance({
                    transactionID: transaction?.transactionID,
                    transactionThreadReportID: report?.reportID,
                    waypoints,
                    ...(hasRouteChanged ? {routes: transaction?.routes} : {}),
                    policy,
                    transactionBackup,
                });
            }
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
            shouldShowNotFoundPage={isEditing && !transaction?.comment?.waypoints}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <>
                <View style={styles.flex1}>
                    <DraggableList
                        data={waypointsList}
                        keyExtractor={(item) => (waypoints[item]?.keyForList ?? waypoints[item]?.address ?? '') + item}
                        onDragEnd={updateWaypoints}
                        ref={scrollViewRef}
                        renderItem={renderItem}
                        ListFooterComponent={
                            <DistanceRequestFooter
                                waypoints={waypoints}
                                navigateToWaypointEditPage={navigateToWaypointEditPage}
                                transaction={transaction}
                                policy={policy}
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
                        style={[styles.w100, styles.mb5, styles.ph5, styles.flexShrink0]}
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
