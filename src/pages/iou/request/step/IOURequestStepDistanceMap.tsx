import {deepEqual} from 'fast-equals';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import type {RenderItemParams} from 'react-native-draggable-flatlist/lib/typescript/types';
import type {OnyxEntry} from 'react-native-onyx';
import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFetchRoute from '@hooks/useFetchRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useWaypointItems from '@hooks/useWaypointItems';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestDistance} from '@libs/actions/IOU/UpdateMoneyRequest';
import {init, stop} from '@libs/actions/MapboxToken';
import {openDraftDistanceExpense, removeWaypoint, updateWaypoints as updateWaypointsUtil} from '@libs/actions/Transaction';
import {getLatestErrorField} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';
import {getRateID, getRequestType, haveWaypointAddressesChanged} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type TransactionStateType from '@src/types/utils/TransactionStateType';
import DistanceMapTabContent from './DistanceMapTabContent';
import useDistanceNavigation from './IOURequestStepDistance/hooks/useDistanceNavigation';
import useDistanceRequestData from './IOURequestStepDistance/hooks/useDistanceRequestData';
import useDistanceTransactionBackup from './IOURequestStepDistance/hooks/useDistanceTransactionBackup';
import useWaypointValidation, {isWaypointEmpty} from './IOURequestStepDistance/hooks/useWaypointValidation';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceMapProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceMap({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport, reportActionID},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceMapProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isArchived = useReportIsArchived(report?.reportID);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const selfDMReport = useSelfDMReport();
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [optimisticWaypoints, setOptimisticWaypoints] = useState<WaypointCollection | null>(null);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const currentTransaction = isEditingSplit && !isEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;

    const transactionWaypoints = currentTransaction?.comment?.waypoints;
    const areTransactionWaypointsEmpty = !transactionWaypoints || Object.values(transactionWaypoints).every((w) => isEmptyObject(w));

    const waypoints = useMemo(() => {
        return (
            optimisticWaypoints ??
            (areTransactionWaypointsEmpty
                ? {
                      waypoint0: {keyForList: 'start_waypoint'},
                      waypoint1: {keyForList: 'stop_waypoint'},
                  }
                : transactionWaypoints)
        );
    }, [optimisticWaypoints, transactionWaypoints, areTransactionWaypointsEmpty]);
    const reportAttributesDerived = useReportAttributes();

    let transactionState: TransactionStateType = CONST.TRANSACTION.STATE.CURRENT;
    if (isEditingSplit) {
        transactionState = CONST.TRANSACTION.STATE.SPLIT_DRAFT;
    } else if (shouldUseTransactionDraft(action)) {
        transactionState = CONST.TRANSACTION.STATE.DRAFT;
    }
    const backupWaypoints = transactionBackup?.pendingFields?.waypoints ? transactionBackup?.comment?.waypoints : undefined;
    // When online, fetch the backup route to ensure the map is populated even if the user does not save the transaction.
    // Fetch the backup route first to ensure the backup transaction map is updated before the main transaction map.
    // This prevents a scenario where the main map loads, the user dismisses the map editor, and the backup map has not yet loaded due to delay.
    useFetchRoute(transactionBackup, backupWaypoints, action, CONST.TRANSACTION.STATE.BACKUP);
    const {shouldFetchRoute, validatedWaypoints} = useFetchRoute(currentTransaction, waypoints, action, transactionState);
    const previousWaypoints = usePrevious(waypoints);
    const numberOfWaypoints = Object.keys(waypoints).length;
    const numberOfPreviousWaypoints = Object.keys(previousWaypoints).length;
    const scrollViewRef = useRef<RNScrollView>(null);
    const isLoadingRoute = currentTransaction?.comment?.isLoading ?? false;
    const isLoading = currentTransaction?.isLoading ?? false;
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const hasRouteError = !!currentTransaction?.errorFields?.route;
    const [shouldShowAtLeastTwoDifferentWaypointsError, setShouldShowAtLeastTwoDifferentWaypointsError] = useState(false);

    const {nonEmptyWaypointsCount, isWaypointsNullIslandError, duplicateWaypointsError, atLeastTwoDifferentWaypointsError} = useWaypointValidation({waypoints, validatedWaypoints});
    const isCreatingNewRequest = !(backTo || isEditing);
    const [recentWaypoints, {status: recentWaypointsStatus}] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const iouRequestType = getRequestType(currentTransaction);
    const customUnitRateID = getRateID(currentTransaction);

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, currentTransaction);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    const setDistanceRequestData = useDistanceRequestData({policy, personalPolicy, transaction, customUnitRateID, transactionID, isSplitRequest});

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return iouType !== CONST.IOU.TYPE.SPLIT && !isArchived && !(isPolicyExpenseChatUtil(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));
    }, [report, skipConfirmation, policy?.requiresCategory, policy?.requiresTag, isArchived, iouType]);
    let buttonText = !isCreatingNewRequest ? translate('common.save') : translate('common.next');
    if (shouldSkipConfirmation) {
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            buttonText = translate('iou.split');
        } else {
            buttonText = translate('iou.createExpense');
        }
    }

    useEffect(() => {
        if (iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE_MAP || isOffline || recentWaypointsStatus === 'loading' || recentWaypoints !== undefined) {
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

    const transactionWasSaved = useRef(false);
    useDistanceTransactionBackup({
        transaction,
        isCreatingNewRequest,
        isEditingSplit: false,
        isDraft: shouldUseTransactionDraft(action),
        introSelected,
        betas,
        transactionWasSavedRef: transactionWasSaved,
    });

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

    const navigateToNextStep = useDistanceNavigation({
        iouType,
        report,
        policy,
        transaction,
        reportID,
        transactionID,
        reportAttributesDerived,
        personalDetails,
        waypoints,
        currentUserLogin: currentUserEmailParam,
        currentUserAccountID: currentUserAccountIDParam,
        backTo,
        backToReport,
        shouldSkipConfirmation,
        defaultExpensePolicy,
        isArchived,
        isAutoReporting: !!personalPolicy?.autoReporting,
        isASAPSubmitBetaEnabled,
        setDistanceRequestData,
        translate,
        selfDMReport,
        policyForMovingExpenses,
        betas,
        recentWaypoints,
        introSelected,
    });

    const getError = useCallback(() => {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return getLatestErrorField(currentTransaction, 'route');
        }
        if (isWaypointsNullIslandError) {
            return {isWaypointsNullIslandError: `${translate('common.please')} ${translate('common.fixTheErrors')} ${translate('common.inTheFormBeforeContinuing')}.`} as Errors;
        }
        if (duplicateWaypointsError) {
            return {duplicateWaypointsError: translate('iou.error.duplicateWaypointsErrorMessage')} as Errors;
        }
        if (atLeastTwoDifferentWaypointsError) {
            return {atLeastTwoDifferentWaypointsError: translate('iou.error.atLeastTwoDifferentWaypoints')} as Errors;
        }
        return {};
    }, [hasRouteError, isWaypointsNullIslandError, duplicateWaypointsError, atLeastTwoDifferentWaypointsError, currentTransaction, translate]);

    type DataParams = {
        data: string[];
    };

    const {waypointItems, getWaypoint, getWaypointKey, extractKey} = useWaypointItems(waypoints);

    const updateWaypoints = useCallback(
        ({data}: DataParams) => {
            if (deepEqual(waypointItems, data)) {
                return;
            }

            const newWaypoints: WaypointCollection = {};
            let emptyWaypointIndex = -1;
            for (const [index, item] of data.entries()) {
                newWaypoints[`waypoint${index}`] = getWaypoint(item) ?? {};
                // Find waypoint that BECOMES empty after dragging
                if (isWaypointEmpty(newWaypoints[`waypoint${index}`]) && !isWaypointEmpty(waypoints[`waypoint${index}`])) {
                    emptyWaypointIndex = index;
                }
            }

            setOptimisticWaypoints(newWaypoints);
            const shouldPassSplitDraft = isEditingSplit && !isEmpty(splitDraftTransaction);

            Promise.all([
                removeWaypoint(currentTransaction, emptyWaypointIndex.toString(), shouldUseTransactionDraft(action), shouldPassSplitDraft ? splitDraftTransaction : undefined),
                updateWaypointsUtil(transactionID, newWaypoints, transactionState),
            ]).then(() => {
                setOptimisticWaypoints(null);
            });
        },
        [waypointItems, isEditingSplit, splitDraftTransaction, currentTransaction, action, transactionID, transactionState, getWaypoint, waypoints],
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
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit && transaction) {
                setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {waypoints}, policy);
                navigateBack();
                return;
            }

            // If nothing was changed, simply go to transaction thread
            // We compare only addresses because numbers are rounded while backup
            const hasRouteChanged = !deepEqual(transactionBackup?.routes, transaction?.routes);
            if (!haveWaypointAddressesChanged(transactionBackup?.comment?.waypoints, waypoints)) {
                navigateBack();
                return;
            }
            if (transaction?.transactionID && report?.reportID) {
                updateMoneyRequestDistance({
                    transaction,
                    transactionThreadReport: report,
                    parentReport,
                    waypoints,
                    recentWaypoints,
                    ...(hasRouteChanged ? {routes: transaction?.routes} : {}),
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    transactionBackup,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    parentReportNextStep,
                });
            }
            transactionWasSaved.current = true;
            navigateBack();
            return;
        }

        navigateToNextStep();
    }, [
        duplicateWaypointsError,
        atLeastTwoDifferentWaypointsError,
        hasRouteError,
        isLoadingRoute,
        isEditing,
        isLoading,
        isCreatingNewRequest,
        navigateToNextStep,
        isEditingSplit,
        transaction,
        transactionBackup,
        waypoints,
        report,
        navigateBack,
        splitDraftTransaction,
        policy,
        parentReport,
        policyTags,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        parentReportNextStep,
        recentWaypoints,
    ]);

    const renderItem = useCallback(
        ({item, drag, isActive, getIndex}: RenderItemParams<string>) => {
            const index = getIndex?.();
            const sentryLabel = index === 0 ? CONST.SENTRY_LABEL.IOU_REQUEST_STEP.WAYPOINT_START_MENU_ITEM : CONST.SENTRY_LABEL.IOU_REQUEST_STEP.WAYPOINT_STOP_MENU_ITEM;
            return (
                <DistanceRequestRenderItem
                    waypoints={waypoints}
                    item={getWaypointKey(item)}
                    onSecondaryInteraction={drag}
                    isActive={isActive}
                    getIndex={getIndex}
                    onPress={navigateToWaypointEditPage}
                    disabled={isLoadingRoute}
                    sentryLabel={sentryLabel}
                />
            );
        },
        [isLoadingRoute, navigateToWaypointEditPage, waypoints, getWaypointKey],
    );

    const errorState = useMemo(
        () => ({shouldShowAtLeastTwoDifferentWaypointsError, atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, getError}),
        [shouldShowAtLeastTwoDifferentWaypointsError, atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, getError],
    );

    const loadingState = useMemo(() => ({isOffline, isLoadingRoute, shouldFetchRoute, isLoading}), [isOffline, isLoadingRoute, shouldFetchRoute, isLoading]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepDistanceMap"
            shouldShowNotFoundPage={(isEditing && !currentTransaction?.comment?.waypoints) || shouldShowNotFoundPage}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <DistanceMapTabContent
                waypointItems={waypointItems}
                waypoints={waypoints}
                extractKey={extractKey}
                updateWaypoints={updateWaypoints}
                scrollViewRef={scrollViewRef}
                renderItem={renderItem}
                navigateToWaypointEditPage={navigateToWaypointEditPage}
                transaction={transaction}
                policy={policy}
                submitWaypoints={submitWaypoints}
                buttonText={buttonText}
                errorState={errorState}
                loadingState={loadingState}
            />
        </StepScreenWrapper>
    );
}

const IOURequestStepDistanceMapWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceMap);

const IOURequestStepDistanceMapWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceMapWithCurrentUserPersonalDetails, true);

const IOURequestStepDistanceMapWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceMapWithWritableReportOrNotFound);

export default IOURequestStepDistanceMapWithFullTransactionOrNotFound;
