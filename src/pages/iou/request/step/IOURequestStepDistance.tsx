import {deepEqual} from 'fast-equals';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import type {RenderItemParams} from 'react-native-draggable-flatlist/lib/typescript/types';
import type {OnyxEntry} from 'react-native-onyx';
import DistanceRequestRenderItem from '@components/DistanceRequest/DistanceRequestRenderItem';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import TabSelector from '@components/TabSelector/TabSelector';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDistanceRateOriginalPolicy from '@hooks/useDistanceRateOriginalPolicy';
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
import {setMoneyRequestDistance} from '@libs/actions/IOU';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestDistance} from '@libs/actions/IOU/UpdateMoneyRequest';
import {init, stop} from '@libs/actions/MapboxToken';
import {openDraftDistanceExpense, removeWaypoint, updateWaypoints as updateWaypointsUtil} from '@libs/actions/Transaction';
import {removeBackupTransaction} from '@libs/actions/TransactionEdit';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';
import {getDistanceInMeters, getRateID, getRequestType, haveWaypointAddressesChanged} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type TransactionStateType from '@src/types/utils/TransactionStateType';
import DistanceManualTabContent from './DistanceManualTabContent';
import DistanceMapTabContent from './DistanceMapTabContent';
import useDistanceNavigation from './IOURequestStepDistance/hooks/useDistanceNavigation';
import useDistanceRequestData from './IOURequestStepDistance/hooks/useDistanceRequestData';
import useDistanceTransactionBackup from './IOURequestStepDistance/hooks/useDistanceTransactionBackup';
import useWaypointValidation, {isWaypointEmpty} from './IOURequestStepDistance/hooks/useWaypointValidation';
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
        params: {action, iouType, reportID, transactionID, backTo, backToReport, reportActionID},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isArchived = useReportIsArchived(report?.reportID);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);

    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [originalSplitTransactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const selfDMReport = useSelfDMReport();
    const policy = usePolicy(report?.policyID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(transaction?.comment?.customUnit?.customUnitRateID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [optimisticWaypoints, setOptimisticWaypoints] = useState<WaypointCollection | null>(null);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
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
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {nonEmptyWaypointsCount, isWaypointsNullIslandError, duplicateWaypointsError, atLeastTwoDifferentWaypointsError} = useWaypointValidation({waypoints, validatedWaypoints});
    const isCreatingNewRequest = !(backTo || isEditing);
    const [recentWaypoints, {status: recentWaypointsStatus}] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const iouRequestType = getRequestType(currentTransaction);
    const customUnitRateID = getRateID(currentTransaction);

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, currentTransaction);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    // Manual distance editing state
    const manualNumberFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const manualTextInputRef = useRef<BaseTextInputRef | null>(null);
    const [manualFormError, setManualFormError] = useState<string>('');

    const mileageRate = DistanceRequestUtils.getRate({
        transaction: currentTransaction,
        policy,
        useTransactionDistanceUnit: false,
    });
    const distanceUnit = mileageRate.unit;
    const distanceRate = mileageRate.rate ?? 0;
    const currentTransactionDistanceUnit = currentTransaction?.comment?.customUnit?.distanceUnit;
    const currentDistanceInMeters = getDistanceInMeters(currentTransaction, currentTransactionDistanceUnit ?? distanceUnit);
    // While a new route is in flight (the user added/edited a waypoint on the Map tab), `saveWaypoint`
    // clears `customUnit.quantity` and `routes.route0.distance` to null, so `getDistanceInMeters` returns
    // 0. Fall back to the pre-edit `transactionBackup` distance so switching to the Manual tab keeps
    // showing the previous value instead of "0 mi" until the BE returns the new route.
    const distanceInMeters =
        currentDistanceInMeters > 0 ? currentDistanceInMeters : getDistanceInMeters(transactionBackup, transactionBackup?.comment?.customUnit?.distanceUnit ?? distanceUnit);
    const currentDistance = useMemo(
        () => (distanceInMeters > 0 ? roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceInMeters, distanceUnit)) : undefined),
        [distanceInMeters, distanceUnit],
    );

    // Track whether the user has typed in the manual tab so route re-fetches don't clobber in-progress
    // input. Editing waypoints clears this (in the effect below) — a recalculated route supersedes a
    // manual value the same way it would on a fresh map expense (GH #90083).
    const isManuallyEditing = useRef(false);

    // Keep the manual tab input in sync with the recalculated route distance:
    //  - On a waypoint edit, `saveWaypoint`/`updateWaypoints` clear `routes.route0.distance` (and
    //    `customUnit.quantity`) to null, then the BE returns the new geometry. That recalculation wins
    //    over any earlier manual value, so the null → value transition flows back into the manual tab
    //    and re-enables future syncs (GH #90082, #90083).
    //  - A re-fetch of an already-saved expense is also a null → value transition but keeps a non-null
    //    `customUnit.quantity` (the persisted value, possibly a manual override), so we skip it there
    //    to avoid overwriting it (GH #90082).
    // Both signals are read off the same transaction object. The waypoint-edit path clears `routes` and
    // `customUnit.quantity` together, so by the time `routeDistance` comes back non-null `customUnitQuantity`
    // is already null; the re-fetch path never clears `customUnit.quantity` at all. So the `!= null` check
    // below stays correct regardless of the order Onyx delivers those two updates in.
    const routeDistance = currentTransaction?.routes?.route0?.distance;
    const customUnitQuantity = currentTransaction?.comment?.customUnit?.quantity;
    const lastSyncedRouteDistance = useRef<number | null | undefined>(routeDistance);
    useEffect(() => {
        if (routeDistance == null) {
            // The route was cleared because the user edited waypoints — let the new value flow back
            // into the manual tab even if the user had typed a manual distance before (GH #90083).
            if (lastSyncedRouteDistance.current != null) {
                isManuallyEditing.current = false;
            }
            lastSyncedRouteDistance.current = routeDistance;
            return;
        }
        if (!distanceUnit || isManuallyEditing.current) {
            lastSyncedRouteDistance.current = routeDistance;
            return;
        }
        const isNullToValueTransition = lastSyncedRouteDistance.current == null;
        const isPostSaveRefetch = isNullToValueTransition && customUnitQuantity != null;
        if (isPostSaveRefetch || lastSyncedRouteDistance.current === routeDistance) {
            lastSyncedRouteDistance.current = routeDistance;
            return;
        }
        const routeDistanceInUnit = roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(routeDistance, distanceUnit));
        manualNumberFormRef.current?.updateNumber(routeDistanceInUnit.toString());
        lastSyncedRouteDistance.current = routeDistance;
    }, [routeDistance, distanceUnit, customUnitQuantity]);

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

    const transactionWasSaved = useRef(false);
    useDistanceTransactionBackup({
        transaction,
        isCreatingNewRequest,
        isEditingSplit,
        isDraft: shouldUseTransactionDraft(action),
        introSelected,
        betas,
        transactionWasSavedRef: transactionWasSaved,
    });

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const navigateBackAfterSave = useCallback(() => {
        // When editing an individual split, the previous RHP screen is the edit-split page the user
        // wants to return to — `closeRHPFlow` would tear it down too. Use `goBack` so the RHP stays
        // open at the edit-split page.
        if (isEditingSplit) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.closeRHPFlow();
    }, [isEditingSplit, backTo]);

    // In the edit flow this page is rendered inside an OnyxTabNavigator. A plain `goBack()` with no
    // target would be swallowed by that tab navigator (reverting to the Map tab) instead of leaving
    // the page, so the header back must leave explicitly: honor an explicit `backTo` (e.g. the
    // edit-split page) and otherwise close the RHP — matching other tabbed RHP pages like
    // IOURequestStartPage. The browser/hardware back keeps the default tab behavior (revert tab first).
    const navigateBackFromEditFlow = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.closeRHPFlow();
    }, [backTo]);

    /**
     * Takes the user to the page for editing a specific waypoint
     * @param index of the waypoint to edit
     */
    const navigateToWaypointEditPage = useCallback(
        (index: number) => {
            let iouWaypointType = CONST.IOU.TYPE.SUBMIT as IOUType;
            if (isEditingSplit) {
                iouWaypointType = CONST.IOU.TYPE.SPLIT_EXPENSE;
            }
            // In the edit flow this page is wrapped in an OnyxTabNavigator, so Navigation.getActiveRoute()
            // returns a URL with the tab suffix (e.g. "/distance-map") that doesn't match the stack entry
            // — Navigation.goBack() then REPLACEs instead of POPs and crashes. Build the backTo URL
            // explicitly there. The create flow has no tab navigator, so the production getActiveRoute()
            // path is correct (GH #90037).
            const waypointBackTo = isEditing
                ? ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, report?.reportID ?? reportID, backTo)
                : Navigation.getActiveRoute();
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_WAYPOINT.getRoute(action, iouWaypointType, transactionID, report?.reportID ?? reportID, index.toString(), waypointBackTo));
        },
        [action, iouType, transactionID, report?.reportID, reportID, backTo, isEditingSplit, isEditing],
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
    }, [hasRouteError, currentTransaction, isWaypointsNullIslandError, translate, duplicateWaypointsError, atLeastTwoDifferentWaypointsError]);

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
        [waypointItems, getWaypoint, waypoints, isEditingSplit, splitDraftTransaction, currentTransaction, action, transactionID, transactionState],
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
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value in transaction with CONST.IOU.OPTIMISTIC_DISTANCE_SPLIT_TRANSACTION_ID
            if (isEditingSplit && originalSplitTransactionDraft) {
                setDraftSplitTransaction(
                    CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                    originalSplitTransactionDraft,
                    {waypoints: currentTransaction?.comment?.waypoints, routes: currentTransaction?.routes},
                    policy,
                );
                navigateBackAfterSave();
                return;
            }

            // If nothing was changed, simply go to transaction thread.
            // We compare addresses only because numbers are rounded vs. the backup. We also send the
            // update when a manual `customUnit.quantity` override was cleared by `saveWaypoint` (a
            // waypoint re-save resets the distance to the route value), so the BE re-evaluates and
            // clears stale distance violations like `increasedDistance` (GH #90105).
            const hasRouteChanged = !deepEqual(transactionBackup?.routes, transaction?.routes);
            const distanceWasReset = transactionBackup?.comment?.customUnit?.quantity != null && transactionBackup.comment.customUnit.quantity !== transaction?.comment?.customUnit?.quantity;
            if (!haveWaypointAddressesChanged(transactionBackup?.comment?.waypoints, waypoints) && !distanceWasReset) {
                transactionWasSaved.current = true;
                navigateBackAfterSave();
                return;
            }
            const routeDistanceInUnit = currentDistanceInMeters > 0 ? roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(currentDistanceInMeters, distanceUnit)) : undefined;
            if (transaction?.transactionID && report?.reportID) {
                updateMoneyRequestDistance({
                    transaction,
                    transactionThreadReport: report,
                    parentReport,
                    waypoints,
                    recentWaypoints,
                    ...(hasRouteChanged ? {routes: transaction?.routes} : {}),
                    ...(distanceWasReset && routeDistanceInUnit !== undefined ? {distance: routeDistanceInUnit} : {}),
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    transactionBackup,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    parentReportNextStep,
                    distanceOriginalPolicy,
                });
            }
            transactionWasSaved.current = true;
            // Remove the backup eagerly so the parent report view reads the optimistic transaction
            // immediately, instead of the stale backup, while the API request is still in flight.
            removeBackupTransaction(transaction?.transactionID);
            navigateBackAfterSave();
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
        navigateBackAfterSave,
        isEditingSplit,
        originalSplitTransactionDraft,
        transactionBackup,
        waypoints,
        transaction,
        report,
        currentTransaction?.comment?.waypoints,
        currentTransaction?.routes,
        currentDistanceInMeters,
        distanceUnit,
        policy,
        parentReport,
        recentWaypoints,
        policyTags,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        parentReportNextStep,
        distanceOriginalPolicy,
    ]);

    const submitManualDistance = useCallback(() => {
        isManuallyEditing.current = false;

        // For a map-based distance edit, require valid waypoints even when saving from the Manual tab.
        // Without this, clearing waypoints on the Map tab and then saving on Manual would persist a
        // half-broken transaction and surface "Please select a valid waypoint" only post-save. Surface
        // the existing waypoint error inline on the Manual tab so the user sees it immediately.
        const wasOriginallyMapDistance = !isEmpty(transactionBackup?.comment?.waypoints);
        if (wasOriginallyMapDistance && (duplicateWaypointsError || atLeastTwoDifferentWaypointsError || hasRouteError)) {
            setManualFormError(translate('iou.error.atLeastTwoDifferentWaypoints'));
            return;
        }

        const value = manualNumberFormRef.current?.getNumber() ?? '';
        if (!value.length || parseFloat(value) <= 0) {
            setManualFormError(translate('iou.error.invalidDistance'));
            return;
        }
        if (!DistanceRequestUtils.isDistanceAmountWithinLimit(parseFloat(value), distanceRate)) {
            setManualFormError(translate('iou.error.distanceAmountTooLargeReduceDistance'));
            return;
        }

        const distanceAsFloat = roundToTwoDecimalPlaces(parseFloat(value));

        if (isEditingSplit && transaction) {
            setMoneyRequestDistance(transactionID, distanceAsFloat, shouldUseTransactionDraft(action, iouType), distanceUnit);
            setDraftSplitTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, splitDraftTransaction, {distance: distanceAsFloat}, policy);
            navigateBackAfterSave();
            return;
        }

        const transactionDistanceUnit = currentTransaction?.comment?.customUnit?.distanceUnit;
        const isDistanceChanged = currentDistance !== distanceAsFloat;
        const isDistanceUnitChanged = transactionDistanceUnit && transactionDistanceUnit !== distanceUnit;

        // Check if waypoints were edited on the map tab before the user switched to manual.
        // If so, we must still send the update even if the distance value itself didn't change.
        const haveWaypointsChanged = haveWaypointAddressesChanged(transactionBackup?.comment?.waypoints, waypoints);

        if (!isDistanceChanged && !isDistanceUnitChanged && !haveWaypointsChanged) {
            transactionWasSaved.current = true;
            navigateBackAfterSave();
            return;
        }

        const hasRouteChanged = haveWaypointsChanged && !deepEqual(transactionBackup?.routes, transaction?.routes);
        updateMoneyRequestDistance({
            transaction,
            transactionThreadReport: report,
            parentReport,
            waypoints,
            distance: distanceAsFloat,
            ...(hasRouteChanged ? {routes: transaction?.routes} : {}),
            transactionBackup,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            parentReportNextStep,
            recentWaypoints,
        });
        transactionWasSaved.current = true;
        // Remove the backup eagerly so the parent report view reads the optimistic transaction
        // immediately, instead of the stale backup, while the API request is still in flight.
        removeBackupTransaction(transaction?.transactionID);
        navigateBackAfterSave();
    }, [
        translate,
        distanceRate,
        transactionID,
        action,
        iouType,
        distanceUnit,
        isEditingSplit,
        transaction,
        currentTransaction?.comment?.customUnit?.distanceUnit,
        splitDraftTransaction,
        policy,
        navigateBackAfterSave,
        currentDistance,
        waypoints,
        transactionBackup,
        report,
        parentReport,
        policyTags,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        parentReportNextStep,
        recentWaypoints,
        duplicateWaypointsError,
        atLeastTwoDifferentWaypointsError,
        hasRouteError,
    ]);

    const renderItem = useCallback(
        ({item, drag, isActive, getIndex}: RenderItemParams<string>) => (
            <DistanceRequestRenderItem
                waypoints={waypoints}
                item={getWaypointKey(item)}
                onSecondaryInteraction={drag}
                isActive={isActive}
                getIndex={getIndex}
                onPress={navigateToWaypointEditPage}
                disabled={isLoadingRoute}
            />
        ),
        [isLoadingRoute, navigateToWaypointEditPage, waypoints, getWaypointKey],
    );

    const handleManualInputChange = useCallback(() => {
        isManuallyEditing.current = true;
        if (!manualFormError) {
            return;
        }
        setManualFormError('');
    }, [manualFormError]);

    const errorState = useMemo(
        () => ({shouldShowAtLeastTwoDifferentWaypointsError, atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, getError}),
        [shouldShowAtLeastTwoDifferentWaypointsError, atLeastTwoDifferentWaypointsError, duplicateWaypointsError, hasRouteError, getError],
    );

    const loadingState = useMemo(() => ({isOffline, isLoadingRoute, shouldFetchRoute, isLoading}), [isOffline, isLoadingRoute, shouldFetchRoute, isLoading]);

    const renderMapTab = useCallback(
        () => (
            <TabScreenWithFocusTrapWrapper>
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
            </TabScreenWithFocusTrapWrapper>
        ),
        [waypointItems, waypoints, extractKey, updateWaypoints, renderItem, navigateToWaypointEditPage, transaction, policy, submitWaypoints, buttonText, errorState, loadingState],
    );

    const renderManualTab = useCallback(
        () => (
            <TabScreenWithFocusTrapWrapper>
                <DistanceManualTabContent
                    currentDistance={currentDistance}
                    distanceUnit={distanceUnit}
                    onSubmit={submitManualDistance}
                    manualFormError={manualFormError}
                    onInputChange={handleManualInputChange}
                    manualTextInputRef={manualTextInputRef}
                    manualNumberFormRef={manualNumberFormRef}
                />
            </TabScreenWithFocusTrapWrapper>
        ),
        [currentDistance, distanceUnit, submitManualDistance, manualFormError, handleManualInputChange],
    );

    if (isEditing) {
        return (
            <StepScreenWrapper
                headerTitle={translate('common.distance')}
                onBackButtonPress={navigateBackFromEditFlow}
                testID="IOURequestStepDistance"
                shouldShowNotFoundPage={!currentTransaction?.comment?.waypoints || shouldShowNotFoundPage}
                shouldShowWrapper
            >
                <OnyxTabNavigator
                    id={CONST.TAB.DISTANCE_EDIT_TYPE}
                    defaultSelectedTab={CONST.TAB_REQUEST.DISTANCE_MAP}
                    tabBar={TabSelector}
                >
                    <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_MAP}>{renderMapTab}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB_REQUEST.DISTANCE_MANUAL}>{renderManualTab}</TopTab.Screen>
                </OnyxTabNavigator>
            </StepScreenWrapper>
        );
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepDistance"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
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

const IOURequestStepDistanceWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistance);

const IOURequestStepDistanceWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceWithCurrentUserPersonalDetails, true);

const IOURequestStepDistanceWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceWithWritableReportOrNotFound);

export default IOURequestStepDistanceWithFullTransactionOrNotFound;
