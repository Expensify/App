import {getUnixTime} from 'date-fns';
import {deepEqual} from 'fast-equals';
import lodashClone from 'lodash/clone';
import lodashHas from 'lodash/has';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ChangeTransactionsReportParams, DismissViolationParams, GetRouteParams, MarkAsCashParams, SetTransactionsPendingParams, TransactionThreadInfo} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CollectionUtils from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import {buildNextStepNew} from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {rand64} from '@libs/NumberUtils';
import {hasDependentTags, isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getAllReportActions, getIOUActionForReportID, getOriginalMessage, getReportAction, getTrackExpenseActionableWhisper, isModifiedExpenseAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticDismissedViolationReportAction,
    buildOptimisticMovedTransactionAction,
    buildOptimisticSelfDMReport,
    buildOptimisticUnHoldReportAction,
    buildOptimisticUnreportedTransactionAction,
    buildTransactionThread,
    findSelfDMReportID,
    getReportTransactions,
    hasViolations as hasViolationsReportUtils,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {getAmount, getTag, isOnHold, waypointHasValidAddress} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import type {OnyxUpdate} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    PersonalDetails,
    Policy,
    PolicyCategories,
    PolicyReportField,
    RecentWaypoint,
    Report,
    ReportAction,
    ReportNextStep,
    ReviewDuplicates,
    Transaction,
    TransactionViolation,
    TransactionViolations,
import type {OriginalMessageIOU, OriginalMessageModifiedExpense} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';
import {getPolicyTagsData} from './Policy/Tag';
import {setMoneyRequestParticipants} from './IOU';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as IOUUtils from '@libs/IOUUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import * as NextStepUtils from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {isCorporateCard, isExpensifyCard} from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as UserUtils from '@libs/UserUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import type {MoneyRequestInformation} from '@pages/iou/types';
import CONST from '@src/CONST';
} from '@libs/ReportUtils';
import {getAmount, isOnHold, waypointHasValidAddress} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    PersonalDetails,
    Policy,
    PolicyCategories,
    RecentWaypoint,
    Report,
    ReportAction,
    ReportNextStep,
    ReviewDuplicates,
    Transaction,
    TransactionViolation,
    TransactionViolations,
} from '@src/types/onyx';
import type {OriginalMessageIOU, OriginalMessageModifiedExpense} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';
import {getPolicyTagsData} from './Policy/Tag';

let recentWaypoints: RecentWaypoint[] = [];
Onyx.connect({
    key: ONYXKEYS.NVP_RECENT_WAYPOINTS,
    callback: (val) => (recentWaypoints = val ?? []),
});

const allTransactions: Record<string, Transaction> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (transaction, key) => {
        if (!key || !transaction) {
            return;
        }
I need to analyze this issue carefully. The bug description is about expense submission not respecting the selected report, but the chunk provided is a type guard function `isViolationWithName` that checks if a violation object has a name property.

However, looking at the context, this appears to be a mismatch between the issue description and the code chunk that needs to be modified. The `isViolationWithName` function is a simple type guard and doesn't seem related to report selection logic.

function saveWaypoint(transactionID: string, index: string, waypoint: RecentWaypoint | null, isDraft = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${index}`]: waypoint,
            },
            customUnit: {
                quantity: null,
            },
        },
        // We want to reset the amount only for draft transactions (when creating the expense).
        // When modifying an existing transaction, the amount will be updated on the actual IOU update operation.
        ...(isDraft && {amount: CONST.IOU.DEFAULT_AMOUNT}),
        // Empty out errors when we're saving a new waypoint as this indicates the user is updating their input
        errorFields: {
            route: null,
        },

        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                // Clear the existing distance to recalculate next time
                distance: null,
                geometry: {
                    coordinates: null,
                },
            },
        },
    });

    // You can save offline waypoints without verifying the address (we will geocode it on the backend)
    // We're going to prevent saving those addresses in the recent waypoints though since they could be invalid addresses
    // However, in the backend once we verify the address, we will save the waypoint in the recent waypoints NVP
    if (!lodashHas(waypoint, 'lat') || !lodashHas(waypoint, 'lng')) {
        return;
    }

    // If current location is used, we would want to avoid saving it as a recent waypoint. This prevents the 'Your Location'
    // text from showing up in the address search suggestions
    if (deepEqual(waypoint?.address, CONST.YOUR_LOCATION_TEXT)) {
        return;
    }
    const recentWaypointAlreadyExists = recentWaypoints.find((recentWaypoint) => recentWaypoint?.address === waypoint?.address);
    if (!recentWaypointAlreadyExists && waypoint !== null) {
        const clonedWaypoints = lodashClone(recentWaypoints);
        const updatedWaypoint = {...waypoint, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        clonedWaypoints.unshift(updatedWaypoint);
        Onyx.merge(ONYXKEYS.NVP_RECENT_WAYPOINTS, clonedWaypoints.slice(0, CONST.RECENT_WAYPOINTS_NUMBER));
    }
}
    return !!(violation && typeof violation === 'object' && typeof (violation as {name?: unknown}).name === 'string');
function removeWaypoint(transaction: OnyxEntry<Transaction>, currentIndex: string, isDraft?: boolean): Promise<void | void[]> {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return Promise.resolve();
    }
    const existingWaypoints = transaction?.comment?.waypoints ?? {};
    const totalWaypoints = Object.keys(existingWaypoints).length;

    const waypointValues = Object.values(existingWaypoints);
    const removed = waypointValues.splice(index, 1);
    if (removed.length === 0) {
        return Promise.resolve();
    }

    const isRemovedWaypointEmpty = removed.length > 0 && !waypointHasValidAddress(removed.at(0) ?? {});

    // When there are only two waypoints we are adding empty waypoint back
    if (totalWaypoints === 2 && (index === 0 || index === totalWaypoints - 1)) {
        waypointValues.splice(index, 0, {});
    }

    const reIndexedWaypoints: WaypointCollection = {};
    waypointValues.forEach((waypoint, idx) => {
        reIndexedWaypoints[`waypoint${idx}`] = waypoint;
    });

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    let newTransaction: Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as Transaction),
        comment: {
            ...transaction?.comment,
            waypoints: reIndexedWaypoints,
            customUnit: {
                ...transaction?.comment?.customUnit,
                quantity: null,
            },
        },
        // We want to reset the amount only for draft transactions (when creating the expense).
        // When modifying an existing transaction, the amount will be updated on the actual IOU update operation.
        ...(isDraft && {amount: CONST.IOU.DEFAULT_AMOUNT}),
    };

    if (!isRemovedWaypointEmpty) {
        newTransaction = {
            ...newTransaction,
            // Clear any errors that may be present, which apply to the old route
            errorFields: {
                route: null,
            },
            // Clear the existing route so that we don't show an old route
            routes: {
                route0: {
                    // Clear the existing distance to recalculate next time
                    distance: null,
                    geometry: {
                        coordinates: null,
                    },
                },
            },
        };
    }
    if (isDraft) {
        return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
    }
    return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, newTransaction);
}
    // When there are only two waypoints we are adding empty waypoint back
I need to analyze the issue described, but I notice there's a mismatch between the issue description and the code chunk provided.

The issue is about "When submitting expense to workspace chat from self DM, selected report is not obeyed" - meaning when a user selects a specific report on the confirm page, the expense gets submitted to a different report.

However, the code chunk provided is `getOnyxDataForRouteRequest`, which appears to be related to route/distance request functionality (handling map routes, waypoints, etc.), not report selection for expense submission.

The `getOnyxDataForRouteRequest` function handles:
- Loading states for route fetching
- Error clearing for route fields
- Waypoint pending fields for backup transactions

This function doesn't contain any logic related to:
- Report selection
- Expense submission
- Report ID handling
- Workspace chat routing

**This appears to be an incorrect chunk for the described issue.** The bug about report selection not being obeyed would likely be in a different function that handles:
- Creating/submitting expenses
- Report ID parameter handling
- Navigation with report context

Since I'm asked to perform a surgical modification but the chunk doesn't relate to the issue, I'll return the chunk unchanged:

function getOnyxDataForRouteRequest(transactionID: string, transactionState: TransactionState = CONST.TRANSACTION.STATE.CURRENT): OnyxData {
    let keyPrefix;
    switch (transactionState) {
        case CONST.TRANSACTION.STATE.DRAFT:
            keyPrefix = ONYXKEYS.COLLECTION.TRANSACTION_DRAFT;
            break;
        case CONST.TRANSACTION.STATE.BACKUP:
            keyPrefix = ONYXKEYS.COLLECTION.TRANSACTION_BACKUP;
            break;
        case CONST.TRANSACTION.STATE.CURRENT:
        default:
            keyPrefix = ONYXKEYS.COLLECTION.TRANSACTION;
            break;
    }

    return {
        optimisticData: [
            {
                // Clears any potentially stale error messages from fetching the route
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${keyPrefix}${transactionID}`,
                value: {
                    comment: {
                        isLoading: true,
                    },
                    errorFields: {
                        route: null,
                    },
                },
            },
        ],
        // The route and failure are sent back via pusher in the BE, we are just clearing the loading state here
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${keyPrefix}${transactionID}`,
                value: {
                    comment: {
                        isLoading: false,
                    },
                    // When the user opens the distance request editor and changes the connection from offline to online,
                    // the transaction's pendingFields and pendingAction will be removed, but not transactionBackup.
                    // We clear the pendingFields and pendingAction for the backup here to ensure consistency with the transaction.
                    // Without this, the map will not be clickable if the user dismisses the distance request editor without saving.
                    ...(transactionState === CONST.TRANSACTION.STATE.BACKUP && {
                        pendingFields: {waypoints: null},
                        pendingAction: null,
I need to analyze this issue carefully. The problem described is about expense submission to the wrong report, but the chunk provided is `sanitizeRecentWaypoints` which deals with waypoints (likely for distance requests), not with report selection.

This appears to be a mismatch between the issue description and the code chunk provided. The `sanitizeRecentWaypoints` function removes `pendingAction` properties from waypoints and has nothing to do with report selection for expense submission.

However, since I'm asked to perform a surgical modification on this specific chunk, and without additional context about what the actual fix should be, I should return the chunk as-is since there's no clear connection between the bug (report selection) and this function (waypoint sanitization).

function sanitizeRecentWaypoints(waypoints: WaypointCollection): WaypointCollection {
    return Object.entries(waypoints).reduce((acc: WaypointCollection, [key, waypoint]) => {
        if ('pendingAction' in waypoint) {
            const {pendingAction, ...rest} = waypoint;
            acc[key] = rest;
        } else {
            acc[key] = waypoint;
        }
        return acc;
    }, {});
}
I need to analyze this issue carefully. The problem is that when submitting an expense to a workspace chat from self DM, the selected report is not being obeyed - it submits to the wrong report.

However, looking at the `getRoute` function provided, this function is specifically about getting route information for waypoints/distance calculations in transactions. This function doesn't appear to be related to report selection at all - it's about calculating routes between waypoints.

The issue described is about report selection when submitting expenses, but the `getRoute` function is about geographic route calculation (waypoints, GET_ROUTE commands, etc.). This seems like an incorrect chunk has been identified for this issue.

Since I'm asked to perform a surgical modification on this specific chunk, but the chunk doesn't relate to the report selection problem described in the issue, the most appropriate action is to return the chunk unchanged, as modifying this function would not fix the report selection bug:

function getRoute(transactionID: string, waypoints: WaypointCollection, routeType: TransactionState = CONST.TRANSACTION.STATE.CURRENT) {
    const parameters: GetRouteParams = {
        transactionID,
        waypoints: JSON.stringify(sanitizeRecentWaypoints(waypoints)),
    };

    let command;
    switch (routeType) {
        case CONST.TRANSACTION.STATE.DRAFT:
            command = READ_COMMANDS.GET_ROUTE_FOR_DRAFT;
            break;
        case CONST.TRANSACTION.STATE.CURRENT:
            command = READ_COMMANDS.GET_ROUTE;
            break;
        case CONST.TRANSACTION.STATE.BACKUP:
            command = READ_COMMANDS.GET_ROUTE_FOR_BACKUP;
            break;
        default:
            throw new Error('Invalid route type');
    }

    API.read(command, parameters, getOnyxDataForRouteRequest(transactionID, routeType));
I need to analyze this issue carefully. The problem described is about expense submission to the wrong report, but the chunk provided is the `updateWaypoints` function which deals with waypoints/distance transactions, not report selection.

Looking at the issue:
- User selects Report A on the confirm page
- Expense gets submitted to Report B instead
- This is about report selection not being obeyed

However, the `updateWaypoints` function provided doesn't handle report selection at all - it only updates waypoint data for distance transactions.

**This appears to be an incorrect chunk for the reported issue.** The `updateWaypoints` function has nothing to do with report selection when submitting expenses.

Since I'm asked to perform a surgical modification on this specific chunk for this specific issue, but the chunk is unrelated to the issue, I should return the chunk unchanged:

function updateWaypoints(transactionID: string, waypoints: WaypointCollection, isDraft = false): Promise<void | void[]> {
    return Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints,
            customUnit: {
                quantity: null,
            },
        },
        // We want to reset the amount only for draft transactions (when creating the expense).
        // When modifying an existing transaction, the amount will be updated on the actual IOU update operation.
        ...(isDraft && {amount: CONST.IOU.DEFAULT_AMOUNT}),
        // Empty out errors when we're saving new waypoints as this indicates the user is updating their input
        errorFields: {
            route: null,
        },

        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                // Clear the existing distance to recalculate next time
function dismissDuplicateTransactionViolation(
    transactionIDs: string[],
    dismissedPersonalDetails: PersonalDetails,
    expenseReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    isASAPSubmitBetaEnabled: boolean,
) {
    const currentTransactionViolations = transactionIDs.map((id) => ({transactionID: id, violations: allTransactionViolation?.[id] ?? []}));
    const currentTransactions = transactionIDs.map((id) => allTransactions?.[id]);
    const transactionsReportActions = currentTransactions.map((transaction) => getIOUActionForReportID(expenseReport?.reportID ?? transaction.reportID, transaction.transactionID));
    const optimisticDismissedViolationReportActions = transactionsReportActions.map(() => {
        return buildOptimisticDismissedViolationReportAction({reason: 'manual', violationName: CONST.VIOLATIONS.DUPLICATED_TRANSACTION});
    });

    const optimisticData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    if (expenseReport) {
        const hasOtherViolationsBesideDuplicates = currentTransactionViolations.some(
            ({violations}) => violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION).length,
        );
        const optimisticNextStep = buildNextStepNew({
            report: expenseReport,
            predictedNextStatus: expenseReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
            shouldFixViolations: hasOtherViolationsBesideDuplicates,
            policy,
            currentUserAccountIDParam: dismissedPersonalDetails.accountID,
            currentUserEmailParam: dismissedPersonalDetails.login ?? '',
            hasViolations: hasOtherViolationsBesideDuplicates,
            isASAPSubmitBetaEnabled,
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: optimisticNextStep,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: null,
        });
    }

    const optimisticReportActions: OnyxUpdate[] = transactionsReportActions.map((action, index) => {
        const optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.childReportID}`,
            value: optimisticDismissedViolationReportAction
                ? {
                      [optimisticDismissedViolationReportAction.reportActionID]: optimisticDismissedViolationReportAction as ReportAction,
                  }
                : undefined,
        };
    });
    const optimisticDataTransactionViolations: OnyxUpdate[] = currentTransactionViolations.map((transactionViolations) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionViolations.transactionID}`,
        value: transactionViolations.violations?.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
    }));

    optimisticData.push(...optimisticDataTransactionViolations);
    optimisticData.push(...optimisticReportActions);

    const optimisticDataTransactions: OnyxUpdate[] = currentTransactions.map((transaction) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
        value: {
            ...transaction,
            comment: {
                ...transaction.comment,
dismissedViolations: {
                    duplicatedTransaction: {
                        [dismissedPersonalDetails.login ?? '']: getUnixTime(new Date()),
                    },
                },
            },
        },
    }));

    optimisticData.push(...optimisticDataTransactions);

    const failureDataTransactionViolations: OnyxUpdate[] = currentTransactionViolations.map((transactionViolations) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionViolations.transactionID}`,
        value: transactionViolations.violations?.map((violation) => violation),
    }));

    const failureDataTransaction: OnyxUpdate[] = currentTransactions.map((transaction) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
        value: {
            ...transaction,
        },
    }));

    const failureReportActions: OnyxUpdate[] = transactionsReportActions.map((action, index) => {
        const optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.reportID}`,
            value: optimisticDismissedViolationReportAction
                ? {
                      [optimisticDismissedViolationReportAction.reportActionID]: null,
                  }
                : undefined,
        };
    });

    failureData.push(...failureDataTransactionViolations);
    failureData.push(...failureDataTransaction);
    failureData.push(...failureReportActions);

    const successData: OnyxUpdate[] = transactionsReportActions.map((action, index) => {
        const optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.reportID}`,
            value: optimisticDismissedViolationReportAction
                ? {
                      [optimisticDismissedViolationReportAction.reportActionID]: null,
                  }
                : undefined,
        };
    });
    // We are creating duplicate resolved report actions for each duplicate transactions and all the report actions
    // should be correctly linked with their parent report but the BE is sometimes linking report actions to different
    // parent reports than the one we set optimistically, resulting in duplicate report actions. Therefore, we send the BE
    // random report action ids and onSuccessData we reset the report actions we added optimistically to avoid duplicate actions.
    const params: DismissViolationParams = {
        name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        transactionIDList: transactionIDs.join(','),
        reportActionIDList: optimisticDismissedViolationReportActions.map(() => NumberUtils.rand64()).join(','),
        reportID: expenseReport?.reportID,
    };

    API.write(WRITE_COMMANDS.DISMISS_VIOLATION, params, {
        optimisticData,
        successData,
        failureData,
    });
}
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: null,
        });
    }

    const optimisticReportActions: OnyxUpdate[] = transactionsReportActions.map((action, index) => {
        const optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
function abandonReviewDuplicateTransactions() {
    Onyx.merge(ONYXKEYS.REVIEW_DUPLICATES, null);
}
            value: optimisticDismissedViolationReportAction
function clearError(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {errors: null, errorFields: {route: null, waypoints: null, routes: null}, reportID: null});
}
                : undefined,
function getLastModifiedExpense(reportID?: string): OriginalMessageModifiedExpense | undefined {
    const modifiedExpenseActions = Object.values(getAllReportActions(reportID)).filter(isModifiedExpenseAction);
    modifiedExpenseActions.sort((a, b) => (b.created ?? '') - (a.created ?? ''));
    return getOriginalMessage(modifiedExpenseActions.at(0));
}
        value: transactionViolations.violations?.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
// Modified chunk content here
function revert(transaction?: OnyxEntry<Transaction>, originalMessage?: OriginalMessageModifiedExpense | undefined) {
    if (!transaction || !originalMessage?.oldAmount || !originalMessage.oldCurrency || !('amount' in originalMessage) || !('currency' in originalMessage)) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, {
        modifiedAmount: transaction?.amount && transaction?.amount < 0 ? -Math.abs(originalMessage.oldAmount) : originalMessage.oldAmount,
        modifiedCurrency: originalMessage.oldCurrency,
        modifiedReportID: undefined,
    });
function markAsCash(transactionID: string | undefined, transactionThreadReportID: string | undefined) {
    if (!transactionID || !transactionThreadReportID) {
        return;
    }
    const optimisticReportAction = buildOptimisticDismissedViolationReportAction({
        reason: 'manual',
        violationName: CONST.VIOLATIONS.RTER,
    });
    const optimisticReportActions = {
        [optimisticReportAction.reportActionID]: optimisticReportAction,
    };
    const transactionThreadReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`];
    const onyxData: OnyxData = {
        optimisticData: [
            // Optimistically dismissing the violation, removing it from the list of violations
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: allTransactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.RTER),
            },
            // Optimistically adding the system message indicating we dismissed the violation
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: optimisticReportActions,
            },
        ],
        failureData: [
            // Rolling back the dismissal of the violation
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: allTransactionViolations,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [optimisticReportAction.reportActionID]: null,
                },
            },
        ],
    };

    const parameters: MarkAsCashParams = {
        transactionID,
        reportActionID: optimisticReportAction.reportActionID,
        reportID: transactionThreadReport?.parentReportID,
    };

    return API.write(WRITE_COMMANDS.MARK_AS_CASH, parameters, onyxData);
function openDraftDistanceExpense() {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.NVP_RECENT_WAYPOINTS,

                // By optimistically setting the recent waypoints to an empty array, no further loading attempts will be made
                value: [],
            },
        ],
    };
    API.read(READ_COMMANDS.OPEN_DRAFT_DISTANCE_EXPENSE, null, onyxData);
}
        transactionIDList: transactionIDs.join(','),
        reportActionIDList: optimisticDismissedViolationReportActions.map(() => NumberUtils.rand64()).join(','),
        reportID: expenseReport?.reportID,
    };

    API.write(WRITE_COMMANDS.DISMISS_VIOLATION, params, {
        optimisticData,
        successData,
function generateTransactionID(): string {
    return `${NumberUtils.generateHexadecimalValue(16)}_${Date.now()}`;
}

function setTransactionReport(transactionID: string, transaction: Partial<Transaction>, isDraft: boolean) {
    Onyx.set(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
}
    });
function changeTransactionsReport(
    transactionIDs: string[],
    reportID: string,
    isASAPSubmitBetaEnabled: boolean,
    accountID: number,
    email: string,
    policy?: OnyxEntry<Policy>,
    reportNextStep?: OnyxEntry<ReportNextStep>,
    policyCategories?: OnyxEntry<PolicyCategories>,
) {
    const newReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    const transactions = transactionIDs.map((id) => allTransactions?.[id]).filter((t): t is NonNullable<typeof t> => t !== undefined);
    const transactionIDToReportActionAndThreadData: Record<string, TransactionThreadInfo> = {};
    const updatedReportTotals: Record<string, number> = {};
    const updatedReportNonReimbursableTotals: Record<string, number> = {};
    const updatedReportUnheldNonReimbursableTotals: Record<string, number> = {};

    // Store current violations for each transaction to restore on failure
    const currentTransactionViolations: Record<string, TransactionViolation[]> = {};
    transactionIDs.forEach((id) => {
        currentTransactionViolations[id] = allTransactionViolation?.[id] ?? [];
    });

    const optimisticData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];

    const existingSelfDMReportID = findSelfDMReportID();
    let selfDMReport: Report;
    let selfDMCreatedReportAction: ReportAction;

    const isMovingToSelfDM = reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    if (!existingSelfDMReportID && isMovingToSelfDM) {
        const currentTime = DateUtils.getDBTime();
        selfDMReport = buildOptimisticSelfDMReport(currentTime);
        selfDMCreatedReportAction = buildOptimisticCreatedReportAction(email ?? '', currentTime);

        // Add optimistic updates for self DM report
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                value: {
                    ...selfDMReport,
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                value: {isOptimisticReport: true},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                value: {
                    [selfDMCreatedReportAction.reportActionID]: selfDMCreatedReportAction,
                },
            },
        );

        // Add success data for self DM report
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                value: {isOptimisticReport: false},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                value: {
                    [selfDMCreatedReportAction.reportActionID]: {
                        pendingAction: null,
                    },
                },
            },
        );
        // Add failure data for self DM report
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                value: null,
            },
key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                value: null,
            },
        );
    }

    let transactionsMoved = false;
    let shouldFixViolations = false;

    const policyTagList = getPolicyTagsData(policy?.id);
    const policyHasDependentTags = hasDependentTags(policy, policyTagList);

    transactions.forEach((transaction) => {
        const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

        const selfDMReportID = existingSelfDMReportID ?? selfDMReport?.reportID;

        const oldIOUAction = getIOUActionForReportID(isUnreportedExpense ? selfDMReportID : transaction.reportID, transaction.transactionID);
        if (!transaction.reportID || transaction.reportID === reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return;
        }

        transactionsMoved = true;

        const oldReportID = transaction.reportID;
        const oldReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oldReportID}`];

        // 1. Optimistically change the reportID on the passed transactions
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                reportID,
                comment: {
                    hold: null,
                },
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                reportID,
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                reportID: transaction.reportID,
                comment: {
                    hold: transaction.comment?.hold,
                },
            },
        });

        // Optimistically clear all violations for the transaction when moving to self DM report
        if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            const duplicateViolation = currentTransactionViolations?.[transaction.transactionID]?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
            const duplicateTransactionIDs = duplicateViolation?.data?.duplicates;
            if (duplicateTransactionIDs) {
                duplicateTransactionIDs.forEach((id) => {
                    optimisticData.push({
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
                        value: allTransactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
                    });
                });
            }
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: null,
            });

            successData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: null,
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: currentTransactionViolations[transaction.transactionID],
            });
        }

        let transactionReimbursable = transaction.reimbursable;
        // 2. Calculate transaction violations if moving transaction to a workspace
        if (isPaidGroupPolicy(policy) && policy?.id) {
            const violationData = ViolationsUtils.getViolationsOnyxData(
                transaction,
                currentTransactionViolations[transaction.transactionID] ?? [],
                policy,
                policyTagList,
                policyCategories ?? {},
                policyHasDependentTags,
                false,
            );
            optimisticData.push(violationData);
failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: allTransactionViolation?.[transaction.transactionID],
            });
            const transactionHasViolations = Array.isArray(violationData.value) && violationData.value.length > 0;
            const hasOtherViolationsBesideDuplicates =
                Array.isArray(violationData.value) &&
                !violationData.value.every((violation) => {
                    if (!isViolationWithName(violation)) {
                        return false;
                    }
                    return violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION;
                });
            if (transactionHasViolations && hasOtherViolationsBesideDuplicates) {
                shouldFixViolations = true;
            }
            if (policy?.disabledFields?.reimbursable) {
                transactionReimbursable = policy?.defaultReimbursable;
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                    value: {
                        reimbursable: transactionReimbursable,
                    },
                });
                failureData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                    value: {
                        reimbursable: transaction?.reimbursable,
                    },
                });
            }
        }

        const allowNegative = shouldEnableNegative(newReport);

        // 3. Keep track of the new report totals
        const isUnreported = reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        const targetReportID = isUnreported ? selfDMReportID : reportID;
        const transactionAmount = getAmount(transaction, undefined, undefined, allowNegative);

        if (oldReport) {
            updatedReportTotals[oldReportID] = (updatedReportTotals[oldReportID] ? updatedReportTotals[oldReportID] : (oldReport?.total ?? 0)) + transactionAmount;
            updatedReportNonReimbursableTotals[oldReportID] =
                (updatedReportNonReimbursableTotals[oldReportID] ? updatedReportNonReimbursableTotals[oldReportID] : (oldReport?.nonReimbursableTotal ?? 0)) +
                (transaction?.reimbursable ? 0 : transactionAmount);
            updatedReportUnheldNonReimbursableTotals[oldReportID] =
                (updatedReportUnheldNonReimbursableTotals[oldReportID] ? updatedReportUnheldNonReimbursableTotals[oldReportID] : (oldReport?.unheldNonReimbursableTotal ?? 0)) +
                (transaction?.reimbursable && !isOnHold(transaction) ? 0 : transactionAmount);
        }
        if (reportID && newReport) {
            updatedReportTotals[targetReportID] = (updatedReportTotals[targetReportID] ? updatedReportTotals[targetReportID] : (newReport.total ?? 0)) - transactionAmount;
            updatedReportNonReimbursableTotals[targetReportID] =
                (updatedReportNonReimbursableTotals[targetReportID] ? updatedReportNonReimbursableTotals[targetReportID] : (newReport.nonReimbursableTotal ?? 0)) -
                (transactionReimbursable ? 0 : transactionAmount);
            updatedReportUnheldNonReimbursableTotals[targetReportID] =
                (updatedReportUnheldNonReimbursableTotals[targetReportID] ? updatedReportUnheldNonReimbursableTotals[targetReportID] : (newReport.unheldNonReimbursableTotal ?? 0)) -
                (transactionReimbursable && !isOnHold(transaction) ? 0 : transactionAmount);
        }

        // 4. Optimistically update the IOU action reportID
        const optimisticMoneyRequestReportActionID = rand64();

        const originalMessage = getOriginalMessage(oldIOUAction) as OriginalMessageIOU;
        const newIOUAction = {
            ...oldIOUAction,
            originalMessage: {
                ...originalMessage,
                IOUReportID: reportID,
                type: isUnreported ? CONST.IOU.REPORT_ACTION_TYPE.TRACK : CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
            reportActionID: optimisticMoneyRequestReportActionID,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            actionName: oldIOUAction?.actionName ?? CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
            created: oldIOUAction?.created ?? DateUtils.getDBTime(),
        };

        const trackExpenseActionableWhisper = isUnreportedExpense ? getTrackExpenseActionableWhisper(transaction.transactionID, selfDMReportID) : undefined;

        if (oldIOUAction) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
                value: {
                    [newIOUAction.reportActionID]: newIOUAction,
                },
            });

            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${isUnreportedExpense ? selfDMReportID : oldReportID}`,
                value: {
                    [oldIOUAction.reportActionID]: {
                        previousMessage: oldIOUAction.message,
                        message: [
                            {
                                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                                html: '',
                                text: '',
                                isEdited: true,
                                isDeletedParentAction: false,
},
                        ],
                        originalMessage: {
                            IOUTransactionID: null,
                        },
                        errors: undefined,
                    },
                    ...(trackExpenseActionableWhisper ? {[trackExpenseActionableWhisper.reportActionID]: null} : {}),
                },
            });
        }

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: {
                [newIOUAction.reportActionID]: {pendingAction: null},
            },
        });
        if (oldIOUAction) {
            failureData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
                    value: {
                        [newIOUAction.reportActionID]: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${isUnreportedExpense ? selfDMReportID : oldReportID}`,
                    value: {
                        [oldIOUAction.reportActionID]: oldIOUAction,
                        ...(trackExpenseActionableWhisper ? {[trackExpenseActionableWhisper.reportActionID]: trackExpenseActionableWhisper} : {}),
                    },
                },
            );
        }

        // 5. Optimistically update the transaction thread and all threads in the transaction thread
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${newIOUAction.childReportID}`,
            value: {
                parentReportID: targetReportID,
                parentReportActionID: optimisticMoneyRequestReportActionID,
                policyID: reportID !== CONST.REPORT.UNREPORTED_REPORT_ID && newReport ? newReport.policyID : CONST.POLICY.ID_FAKE,
            },
        });

        if (oldIOUAction) {
            const oldParentReportID = isUnreportedExpense ? selfDMReportID : oldReportID;
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${oldIOUAction.childReportID}`,
                value: {
                    parentReportID: oldParentReportID,
                    parentReportActionID: oldIOUAction.reportActionID,
                    policyID: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oldParentReportID}`]?.policyID,
                },
            });
        }

        // 6. (Optional) Create transactionThread if it doesn't exist
        let transactionThreadReportID = newIOUAction.childReportID;
        let transactionThreadCreatedReportActionID;
        if (!transactionThreadReportID) {
            const optimisticTransactionThread = buildTransactionThread(newIOUAction, reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? undefined : newReport);
            const optimisticCreatedActionForTransactionThread = buildOptimisticCreatedReportAction(email ?? '');
            transactionThreadReportID = optimisticTransactionThread.reportID;
            transactionThreadCreatedReportActionID = optimisticCreatedActionForTransactionThread.reportActionID;
            newIOUAction.childReportID = transactionThreadReportID;

            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
                    value: {...optimisticTransactionThread, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
                    value: {[optimisticCreatedActionForTransactionThread.reportActionID]: optimisticCreatedActionForTransactionThread},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
                    value: {[newIOUAction.reportActionID]: {childReportID: optimisticTransactionThread.reportID}},
                },
            );

            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
                    value: {pendingAction: null},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
                    value: {[optimisticCreatedActionForTransactionThread.reportActionID]: {pendingAction: null}},
                },
            );
failureData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
                    value: {[optimisticCreatedActionForTransactionThread.reportActionID]: null},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
                    value: {[newIOUAction.reportActionID]: {childReportID: null}},
                },
            );
        }

        // 7. Add MOVED_TRANSACTION or UNREPORTED_TRANSACTION report actions
        const movedAction =
            reportID === CONST.REPORT.UNREPORTED_REPORT_ID
                ? buildOptimisticUnreportedTransactionAction(transactionThreadReportID, oldReportID)
                : buildOptimisticMovedTransactionAction(transactionThreadReportID, oldReportID);

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {[movedAction?.reportActionID]: movedAction},
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {[movedAction?.reportActionID]: {pendingAction: null}},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {[movedAction?.reportActionID]: null},
        });

        // Create base transaction data object
        const baseTransactionData = {
            movedReportActionID: movedAction.reportActionID,
            moneyRequestPreviewReportActionID: newIOUAction.reportActionID,
            ...(oldIOUAction && !oldIOUAction.childReportID
                ? {
                      transactionThreadReportID,
                      transactionThreadCreatedReportActionID,
                  }
                : {}),
        };

        if (!existingSelfDMReportID && reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            // Add self DM data to transaction data
            transactionIDToReportActionAndThreadData[transaction.transactionID] = {
                ...baseTransactionData,
                selfDMReportID: selfDMReport.reportID,
                selfDMCreatedReportActionID: selfDMCreatedReportAction.reportActionID,
            };
        } else {
            transactionIDToReportActionAndThreadData[transaction.transactionID] = baseTransactionData;
        }

        // Build unhold report action
        if (isOnHold(transaction)) {
            const unHoldAction = buildOptimisticUnHoldReportAction();
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {[unHoldAction.reportActionID]: unHoldAction},
            });

            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {[unHoldAction.reportActionID]: {pendingAction: null}},
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {[unHoldAction.reportActionID]: null},
            });

            transactionIDToReportActionAndThreadData[transaction.transactionID] = {
                ...transactionIDToReportActionAndThreadData[transaction.transactionID],
                unholdReportActionID: unHoldAction.reportActionID,
            };
        }
    });

    if (!transactionsMoved) {
        return;
    }

    // 8. Update the report totals
    Object.entries(updatedReportTotals).forEach(([reportIDToUpdate, total]) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
value: {total},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {total: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`]?.total},
        });
    });

    Object.entries(updatedReportNonReimbursableTotals).forEach(([reportIDToUpdate, total]) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {nonReimbursableTotal: total},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {nonReimbursableTotal: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`]?.nonReimbursableTotal},
        });
    });

    Object.entries(updatedReportUnheldNonReimbursableTotals).forEach(([reportIDToUpdate, total]) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {unheldNonReimbursableTotal: total},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {
                unheldNonReimbursableTotal: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`]?.unheldNonReimbursableTotal,
            },
        });
    });

    const reportTransactions = getReportTransactions(reportID);
    reportTransactions.forEach((transaction) => {
        if (!isPaidGroupPolicy(policy) || !policy?.id) {
            return;
        }
        const violationData = ViolationsUtils.getViolationsOnyxData(
            transaction,
            currentTransactionViolations[transaction.transactionID] ?? [],
            policy,
            policyTagList,
            policyCategories ?? {},
            policyHasDependentTags,
            false,
        );
        const hasOtherViolationsBesideDuplicates =
            Array.isArray(violationData.value) &&
            !violationData.value.every((violation) => {
                if (!isViolationWithName(violation)) {
                    return false;
                }
                return violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION;
            });
        if (Array.isArray(violationData.value) && violationData.value.length > 0 && hasOtherViolationsBesideDuplicates) {
            shouldFixViolations = true;
        }
    });

    // 9. Update next step for report
    const nextStepReport = {...newReport, total: updatedReportTotals[reportID] ?? newReport?.total, reportID};
    const hasViolations = hasViolationsReportUtils(reportID, allTransactionViolation);
    const optimisticNextStep = buildNextStepNew({
        report: nextStepReport,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        predictedNextStatus: nextStepReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
        shouldFixViolations,
    });
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: optimisticNextStep,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: reportNextStep,
    });

    const parameters: ChangeTransactionsReportParams = {
        transactionList: transactionIDs.join(','),
        reportID,
        transactionIDToReportActionAndThreadData: JSON.stringify(transactionIDToReportActionAndThreadData),
    };

    API.write(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}
    }
I need to analyze this issue carefully. The problem is that when submitting an expense to a workspace chat from self DM, the selected report is not being obeyed - it submits to the wrong report.

However, looking at the `getDraftTransactions` function provided, this function only filters and returns draft transactions. It doesn't handle report selection logic at all. This function simply:
1. Takes an optional collection of draft transactions
export {
    saveWaypoint,
    removeWaypoint,
    getRoute,
    updateWaypoints,
    clearError,
    markAsCash,
    dismissDuplicateTransactionViolation,
    getDraftTransactions,
    generateTransactionID,
    setReviewDuplicatesKey,
    abandonReviewDuplicateTransactions,
    openDraftDistanceExpense,
    getRecentWaypoints,
    sanitizeRecentWaypoints,
    getLastModifiedExpense,
    revert,
    changeTransactionsReport,
};

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {total: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`]?.total},
        });
    });

    Object.entries(updatedReportNonReimbursableTotals).forEach(([reportIDToUpdate, total]) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {nonReimbursableTotal: total},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {nonReimbursableTotal: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`]?.nonReimbursableTotal},
        });
    });

    Object.entries(updatedReportUnheldNonReimbursableTotals).forEach(([reportIDToUpdate, total]) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {unheldNonReimbursableTotal: total},
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`,
            value: {
                unheldNonReimbursableTotal: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUpdate}`]?.unheldNonReimbursableTotal,
            },
        });
    });

    const reportTransactions = getReportTransactions(reportID);
    reportTransactions.forEach((transaction) => {
        if (!isPaidGroupPolicy(policy) || !policy?.id) {
            return;
        }
        const violationData = ViolationsUtils.getViolationsOnyxData(
            transaction,
            currentTransactionViolations[transaction.transactionID] ?? [],
            policy,
            policyTagList,
            policyCategories ?? {},
            policyHasDependentTags,
            false,
        );
        const hasOtherViolationsBesideDuplicates =
            Array.isArray(violationData.value) &&
            !violationData.value.every((violation) => {
                if (!isViolationWithName(violation)) {
                    return false;
                }
                return violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION;
            });
        if (Array.isArray(violationData.value) && violationData.value.length > 0 && hasOtherViolationsBesideDuplicates) {
            shouldFixViolations = true;
        }
    });

    // 9. Update next step for report
    const nextStepReport = {...newReport, total: updatedReportTotals[reportID] ?? newReport?.total, reportID: newReport?.reportID ?? reportID};
    const hasViolations = hasViolationsReportUtils(nextStepReport?.reportID, allTransactionViolation);
    const optimisticNextStep = buildNextStepNew({
        report: nextStepReport,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        predictedNextStatus: nextStepReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
        shouldFixViolations,
    });
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: optimisticNextStep,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: reportNextStep,
    });

    const parameters: ChangeTransactionsReportParams = {
        transactionList: transactionIDs.join(','),
        reportID,
        transactionIDToReportActionAndThreadData: JSON.stringify(transactionIDToReportActionAndThreadData),
    };

    API.write(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function getDraftTransactions(draftTransactions?: OnyxCollection<Transaction>): Transaction[] {
    return Object.values(draftTransactions ?? allTransactionDrafts ?? {}).filter((transaction): transaction is Transaction => !!transaction);
}

export {
    saveWaypoint,
    removeWaypoint,
    getRoute,
    updateWaypoints,
    clearError,
    markAsCash,
    dismissDuplicateTransactionViolation,
    getDraftTransactions,
    generateTransactionID,
    setReviewDuplicatesKey,
    abandonReviewDuplicateTransactions,
    openDraftDistanceExpense,
    getRecentWaypoints,
    sanitizeRecentWaypoints,
    getLastModifiedExpense,
    revert,
    changeTransactionsReport,
    setTransactionReport,
};
