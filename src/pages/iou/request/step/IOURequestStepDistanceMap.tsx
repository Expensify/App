import reportsSelector from '@selectors/Attributes';
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
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFetchRoute from '@hooks/useFetchRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOURequestPolicyID, setMoneyRequestAmount, setSplitShares, updateMoneyRequestDistance} from '@libs/actions/IOU';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import {init, stop} from '@libs/actions/MapboxToken';
import {openReport} from '@libs/actions/Report';
import {openDraftDistanceExpense, removeWaypoint, updateWaypoints as updateWaypointsUtil} from '@libs/actions/Transaction';
import {createBackupTransaction, removeBackupTransaction, restoreOriginalTransactionFromBackup} from '@libs/actions/TransactionEdit';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicy} from '@libs/PolicyUtils';
import {getInvoiceReceiverPolicyID, isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';
import {getDistanceInMeters, getRateID, getRequestType, hasRoute, isCustomUnitRateIDForP2P, isWaypointNullIsland} from '@libs/TransactionUtils';
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
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const isArchived = isArchivedReport(reportNameValuePairs);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [transactionBackup] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});
    const personalPolicy = usePersonalPolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [optimisticWaypoints, setOptimisticWaypoints] = useState<WaypointCollection | null>(null);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const waypoints = useMemo(
        () =>
            optimisticWaypoints ??
            transaction?.comment?.waypoints ?? {
                waypoint0: {keyForList: 'start_waypoint'},
                waypoint1: {keyForList: 'stop_waypoint'},
            },
        [optimisticWaypoints, transaction?.comment?.waypoints],
    );
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [chatReportInvoiceReceiverPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true, selector: getInvoiceReceiverPolicyID});
    const [chatReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${chatReportInvoiceReceiverPolicyID}`, {canBeMissing: true});
    const [receiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getInvoiceReceiverPolicyID(report)}`, {canBeMissing: true});

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
    const isWaypointsNullIslandError = useMemo(() => Object.values(waypoints).some(isWaypointNullIsland), [waypoints]);
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
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    // Sets `amount` and `split` share data before moving to the next step to avoid briefly showing `0.00` as the split share for participants
    const setDistanceRequestData = useCallback(
        (participants: Participant[]) => {
            // Get policy report based on transaction participants
            const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
            const selectedReportID = participants?.length === 1 ? (participants.at(0)?.reportID ?? reportID) : reportID;
            const policyReport = participants.at(0) ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`] : report;

            const IOUpolicyID = getIOURequestPolicyID(transaction, policyReport);
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const IOUpolicy = getPolicy(report?.policyID ?? IOUpolicyID);
            const policyCurrency = policy?.outputCurrency ?? personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

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
        [report, allReports, transaction, transactionID, isSplitRequest, policy?.outputCurrency, reportID, customUnitRateID, personalPolicy?.outputCurrency],
    );

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

            // If the user opens IOURequestStepDistanceMap in offline mode and then goes online, re-open the report to fill in missing fields from the transaction backup
            if (!transaction?.reportID || hasRoute(transaction, true)) {
                return;
            }
            openReport(transaction?.reportID);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const navigateToNextStep = useCallback(() => {
        handleMoneyRequestStepDistanceNavigation({
            iouType,
            report,
            policy,
            transaction,
            reportID,
            transactionID,
            reportAttributesDerived,
            personalDetails,
            waypoints,
            customUnitRateID,
            currentUserLogin: currentUserEmailParam,
            currentUserAccountID: currentUserAccountIDParam,
            backTo,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            isArchivedExpenseReport: isArchived,
            isAutoReporting: !!personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            lastSelectedDistanceRates,
            setDistanceRequestData,
            translate,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            privateIsArchived: reportNameValuePairs?.private_isArchived,
            receiverPolicy,
            chatReceiverPolicy,
            allBetas,
        });
    }, [
        transaction,
        backTo,
        report,
        isArchived,
        iouType,
        defaultExpensePolicy,
        currentUserAccountIDParam,
        setDistanceRequestData,
        shouldSkipConfirmation,
        transactionID,
        personalDetails,
        reportAttributesDerived,
        translate,
        currentUserEmailParam,
        policy,
        waypoints,
        lastSelectedDistanceRates,
        backToReport,
        isASAPSubmitBetaEnabled,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        customUnitRateID,
        introSelected,
        activePolicyID,
        personalPolicy?.autoReporting,
        reportID,
        receiverPolicy,
        chatReceiverPolicy,
        allBetas,
    ]);

    const getError = () => {
        // Get route error if available else show the invalid number of waypoints error.
        if (hasRouteError) {
            return getLatestErrorField(transaction, 'route');
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
            for (const [index, waypoint] of data.entries()) {
                newWaypoints[`waypoint${index}`] = waypoints[waypoint] ?? {};
                // Find waypoint that BECOMES empty after dragging
                if (isWaypointEmpty(newWaypoints[`waypoint${index}`]) && !isWaypointEmpty(waypoints[`waypoint${index}`])) {
                    emptyWaypointIndex = index;
                }
            }

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
                    transactionThreadReport: report,
                    parentReport,
                    waypoints,
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
        atLeastTwoDifferentWaypointsError,
        currentUserAccountIDParam,
        currentUserEmailParam,
        duplicateWaypointsError,
        hasRouteError,
        isASAPSubmitBetaEnabled,
        isCreatingNewRequest,
        isEditing,
        isLoading,
        isLoadingRoute,
        navigateBack,
        navigateToNextStep,
        parentReport,
        policy,
        policyTags,
        policyCategories,
        report,
        transaction?.routes,
        transaction?.transactionID,
        transactionBackup,
        waypoints,
        receiverPolicy,
        chatReceiverPolicy,
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
            testID="IOURequestStepDistanceMap"
            shouldShowNotFoundPage={(isEditing && !transaction?.comment?.waypoints) || shouldShowNotFoundPage}
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

const IOURequestStepDistanceMapWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceMap);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceMapWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceMapWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceMapWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceMapWithWritableReportOrNotFound);

export default IOURequestStepDistanceMapWithFullTransactionOrNotFound;
