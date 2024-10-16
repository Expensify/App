import {getUnixTime} from 'date-fns';
import lodashClone from 'lodash/clone';
import lodashHas from 'lodash/has';
import isEqual from 'lodash/isEqual';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {DismissViolationParams, GetRouteParams, MarkAsCashParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CollectionUtils from '@libs/CollectionUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {buildOptimisticDismissedViolationReportAction, buildOptimisticUnHoldReportAction, isCurrentUserSubmitter} from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, RecentWaypoint, ReportAction, ReportActions, ReviewDuplicates, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

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
        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactions[transactionID] = transaction;
    },
});

const allTransactionViolation: OnyxCollection<TransactionViolation[]> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    callback: (transactionViolation, key) => {
        if (!key || !transactionViolation) {
            return;
        }
        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactionViolation[transactionID] = transactionViolation;
    },
});

let allTransactionViolations: TransactionViolations = [];
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    callback: (val) => (allTransactionViolations = val ?? []),
});

function createInitialWaypoints(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                waypoint0: {},
                waypoint1: {},
            },
        },
    });
}

/**
 * Add a stop to the transaction
 */
function addStop(transactionID: string) {
    const transaction = allTransactions?.[transactionID] ?? {};
    const existingWaypoints = transaction?.comment?.waypoints ?? {};
    const newLastIndex = Object.keys(existingWaypoints).length;

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: {
                [`waypoint${newLastIndex}`]: {},
            },
        },
    });
}

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
    if (isEqual(waypoint?.address, CONST.YOUR_LOCATION_TEXT)) {
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

    const isRemovedWaypointEmpty = removed.length > 0 && !TransactionUtils.waypointHasValidAddress(removed.at(0) ?? {});

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
        return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
    }
    return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, newTransaction);
}

function getOnyxDataForRouteRequest(transactionID: string, isDraft = false): OnyxData {
    return {
        optimisticData: [
            {
                // Clears any potentially stale error messages from fetching the route
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
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
                key: `${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    comment: {
                        isLoading: false,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    comment: {
                        isLoading: false,
                    },
                },
            },
        ],
    };
}

/**
 * Sanitizes the waypoints by removing the pendingAction property.
 *
 * @param waypoints - The collection of waypoints to sanitize.
 * @returns The sanitized collection of waypoints.
 */
function sanitizeRecentWaypoints(waypoints: WaypointCollection): WaypointCollection {
    return Object.entries(waypoints).reduce((acc, [key, waypoint]) => {
        const {pendingAction, ...rest} = waypoint as RecentWaypoint;
        acc[key] = rest;
        return acc;
    }, {} as WaypointCollection);
}

/**
 * Gets the route for a set of waypoints
 * Used so we can generate a map view of the provided waypoints
 */
function getRoute(transactionID: string, waypoints: WaypointCollection, isDraft: boolean) {
    const parameters: GetRouteParams = {
        transactionID,
        waypoints: JSON.stringify(sanitizeRecentWaypoints(waypoints)),
    };

    API.read(isDraft ? READ_COMMANDS.GET_ROUTE_FOR_DRAFT : READ_COMMANDS.GET_ROUTE, parameters, getOnyxDataForRouteRequest(transactionID, isDraft));
}

/**
 * Updates all waypoints stored in the transaction specified by the provided transactionID.
 *
 * @param transactionID - The ID of the transaction to be updated
 * @param waypoints - An object containing all the waypoints
 *                             which will replace the existing ones.
 */
function updateWaypoints(transactionID: string, waypoints: WaypointCollection, isDraft = false): Promise<void | void[]> {
    return Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints,
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
                distance: null,
                geometry: {
                    coordinates: null,
                },
            },
        },
    });
}

/**
 * Dismisses the duplicate transaction violation for the provided transactionIDs
 * and updates the transaction to include the dismissed violation in the comment.
 */
function dismissDuplicateTransactionViolation(transactionIDs: string[], dissmissedPersonalDetails: PersonalDetails) {
    const currentTransactionViolations = transactionIDs.map((id) => ({transactionID: id, violations: allTransactionViolation?.[id] ?? []}));
    const currentTransactions = transactionIDs.map((id) => allTransactions?.[id]);
    const transactionsReportActions = currentTransactions.map((transaction) => ReportActionsUtils.getIOUActionForReportID(transaction.reportID ?? '', transaction.transactionID ?? ''));
    const isSubmitter = currentTransactions.every((transaction) => isCurrentUserSubmitter(transaction.reportID ?? ''));
    const optimisticDissmidedViolationReportActions = transactionsReportActions.map(() => {
        if (isSubmitter) {
            return buildOptimisticUnHoldReportAction();
        }
        return buildOptimisticDismissedViolationReportAction({reason: 'manual', violationName: CONST.VIOLATIONS.DUPLICATED_TRANSACTION});
    });

    const optimisticData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    const optimisticReportActions: OnyxUpdate[] = transactionsReportActions.map((action, index) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.childReportID ?? '-1'}`,
        value: {
            [optimisticDissmidedViolationReportActions.at(index)?.reportActionID ?? '']: optimisticDissmidedViolationReportActions.at(index) as ReportAction,
        },
    }));
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
                        [dissmissedPersonalDetails.login ?? '']: getUnixTime(new Date()),
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

    const failureReportActions: OnyxUpdate[] = transactionsReportActions.map((action, index) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.childReportID ?? '-1'}`,
        value: {
            [optimisticDissmidedViolationReportActions.at(index)?.reportActionID ?? '']: null,
        },
    }));

    failureData.push(...failureDataTransactionViolations);
    failureData.push(...failureDataTransaction);
    failureData.push(...failureReportActions);

    const successData: OnyxUpdate[] = transactionsReportActions.map((action, index) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.childReportID ?? '-1'}`,
        value: {
            [optimisticDissmidedViolationReportActions.at(index)?.reportActionID ?? '']: {
                pendingAction: null,
            },
        },
    }));

    const params: DismissViolationParams = {
        name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        transactionIDList: transactionIDs.join(','),
        reportActionIDList: optimisticDissmidedViolationReportActions.map((action) => action.reportActionID).join(','),
    };

    API.write(WRITE_COMMANDS.DISMISS_VIOLATION, params, {
        optimisticData,
        successData,
        failureData,
    });
}

function setReviewDuplicatesKey(values: Partial<ReviewDuplicates>) {
    Onyx.merge(`${ONYXKEYS.REVIEW_DUPLICATES}`, {
        ...values,
    });
}

function abandonReviewDuplicateTransactions() {
    Onyx.set(ONYXKEYS.REVIEW_DUPLICATES, null);
}

function clearError(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {errors: null, errorFields: {route: null}});
}

function markAsCash(transactionID: string, transactionThreadReportID: string) {
    const optimisticReportAction = buildOptimisticDismissedViolationReportAction({
        reason: 'manual',
        violationName: CONST.VIOLATIONS.RTER,
    });
    const optimisticReportActions = {
        [optimisticReportAction.reportActionID]: optimisticReportAction,
    };
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
                value: optimisticReportActions as ReportActions,
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
    };

    return API.write(WRITE_COMMANDS.MARK_AS_CASH, parameters, onyxData);
}

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

function getRecentWaypoints() {
    return recentWaypoints;
}

function getAllTransactionViolationsLength() {
    return allTransactionViolations.length;
}

export {
    addStop,
    createInitialWaypoints,
    saveWaypoint,
    removeWaypoint,
    getRoute,
    updateWaypoints,
    clearError,
    markAsCash,
    dismissDuplicateTransactionViolation,
    setReviewDuplicatesKey,
    abandonReviewDuplicateTransactions,
    openDraftDistanceExpense,
    getRecentWaypoints,
    sanitizeRecentWaypoints,
    getAllTransactionViolationsLength,
};
