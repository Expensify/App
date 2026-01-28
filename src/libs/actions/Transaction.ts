import {getUnixTime} from 'date-fns';
import lodashClone from 'lodash/clone';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    ChangeTransactionsReportParams,
    DismissViolationParams,
    GetDuplicateTransactionDetailsParams,
    GetRouteParams,
    MarkAsCashParams,
    TransactionThreadInfo,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CollectionUtils from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {rand64} from '@libs/NumberUtils';
import {hasDependentTags, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getAllReportActions, getIOUActionForReportID, getOriginalMessage, getTrackExpenseActionableWhisper, isModifiedExpenseAction} from '@libs/ReportActionsUtils';
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
    getTransactionDetails,
    hasViolations as hasViolationsReportUtils,
    shouldEnableNegative,
} from '@libs/ReportUtils';
import {isManagedCardTransaction, isOnHold, shouldClearConvertedAmount, waypointHasValidAddress} from '@libs/TransactionUtils';
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
    ReportNextStepDeprecated,
    ReviewDuplicates,
    Transaction,
    TransactionViolation,
    TransactionViolations,
} from '@src/types/onyx';
import type {OriginalMessageIOU, OriginalMessageModifiedExpense} from '@src/types/onyx/OriginalMessage';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';
import {getPolicyTags} from './IOU/index';

let allTransactionDrafts: OnyxCollection<Transaction> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionDrafts = value ?? {};
    },
});

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allReports = value;
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

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file (https://github.com/Expensify/App/issues/72720)
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getPolicyTagsData(policyID: string | undefined) {
    const allPolicyTags = getPolicyTags();
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

// Helper to safely check for a string 'name' property
function isViolationWithName(violation: unknown): violation is {name: string} {
    return !!(violation && typeof violation === 'object' && typeof (violation as {name?: unknown}).name === 'string');
}

type SaveWaypointProps = {
    transactionID: string;
    index: string;
    waypoint: RecentWaypoint | null;
    isDraft?: boolean;
    recentWaypointsList?: RecentWaypoint[];
    isSplitDraftTransaction?: boolean;
};

function saveWaypoint({transactionID, index, waypoint, isDraft = false, recentWaypointsList = [], isSplitDraftTransaction = false}: SaveWaypointProps) {
    let key: OnyxKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
    if (isDraft) {
        key = `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`;
    } else if (isSplitDraftTransaction) {
        key = `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
    }
    // Saving a waypoint should completely overwrite the existing one at the given index (if any).
    // Onyx merge performs noop on undefined fields. Thus we should fallback to null so the existing fields are cleared.
    const waypointOnyxUpdate: Required<NullishDeep<RecentWaypoint>> | null = waypoint
        ? {
              name: waypoint.name ?? null,
              address: waypoint.address ?? null,
              lat: waypoint.lat ?? null,
              lng: waypoint.lng ?? null,
              keyForList: waypoint.keyForList ?? null,
              pendingAction: waypoint.pendingAction ?? null,
          }
        : null;

    Onyx.merge(key, {
        comment: {
            waypoints: {
                [`waypoint${index}`]: waypointOnyxUpdate,
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

    // If current location is used, we would want to avoid saving it as a recent waypoint. This prevents the 'Your Location'
    // text from showing up in the address search suggestions
    if (waypoint?.address === CONST.YOUR_LOCATION_TEXT) {
        return;
    }
    const recentWaypointAlreadyExists = recentWaypointsList.find((recentWaypoint) => recentWaypoint?.address === waypoint?.address);
    if (!recentWaypointAlreadyExists && waypoint !== null) {
        const clonedWaypoints = lodashClone(recentWaypointsList);
        const updatedWaypoint = {...waypoint, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        clonedWaypoints.unshift(updatedWaypoint);
        Onyx.merge(ONYXKEYS.NVP_RECENT_WAYPOINTS, clonedWaypoints.slice(0, CONST.RECENT_WAYPOINTS_NUMBER));
    }
}

function removeWaypoint(transaction: OnyxEntry<Transaction>, currentIndex: string, isDraft?: boolean, splitDraftTransaction?: OnyxEntry<Transaction>): Promise<void | void[]> {
    // Check if there's a split draft transaction for editing split expenses
    const shouldUseSplitDraft = !isDraft && !!splitDraftTransaction;
    const currentTransaction = shouldUseSplitDraft ? splitDraftTransaction : transaction;

    if (!currentTransaction?.transactionID) {
        return Promise.resolve();
    }

    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return Promise.resolve();
    }
    const existingWaypoints = currentTransaction?.comment?.waypoints ?? {};
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
    for (const [idx, waypoint] of waypointValues.entries()) {
        reIndexedWaypoints[`waypoint${idx}`] = waypoint;
    }

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    let newTransaction: Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...currentTransaction,
        comment: {
            ...currentTransaction?.comment,
            waypoints: reIndexedWaypoints,
            customUnit: {
                ...currentTransaction?.comment?.customUnit,
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
    if (shouldUseSplitDraft) {
        return Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${currentTransaction?.transactionID}` as const, newTransaction);
    }
    if (isDraft) {
        return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${currentTransaction?.transactionID}` as const, newTransaction);
    }
    return Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${currentTransaction?.transactionID}` as const, newTransaction);
}

function getOnyxDataForRouteRequest(
    transactionID: string,
    transactionState: TransactionState = CONST.TRANSACTION.STATE.CURRENT,
): OnyxData<
    typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT | typeof ONYXKEYS.COLLECTION.TRANSACTION_BACKUP | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT
> {
    let keyPrefix;
    switch (transactionState) {
        case CONST.TRANSACTION.STATE.DRAFT:
            keyPrefix = ONYXKEYS.COLLECTION.TRANSACTION_DRAFT;
            break;
        case CONST.TRANSACTION.STATE.SPLIT_DRAFT:
            keyPrefix = ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT;
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
                    }),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${keyPrefix}${transactionID}`,
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

/**
 * Gets the route for a set of waypoints
 * Used so we can generate a map view of the provided waypoints
 */

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
        case CONST.TRANSACTION.STATE.SPLIT_DRAFT:
            command = READ_COMMANDS.GET_ROUTE_FOR_SPLIT_DRAFT;
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
}
/**
 * Updates all waypoints stored in the transaction specified by the provided transactionID.
 *
 * @param transactionID - The ID of the transaction to be updated
 * @param waypoints - An object containing all the waypoints
 *                             which will replace the existing ones.
 */
function updateWaypoints(transactionID: string, waypoints: WaypointCollection, isDraft = false): Promise<void | void[]> {
    // Updating waypoints should completely overwrite the existing ones.
    // Onyx merge performs noop on undefined fields. Thus we should fallback to null so the existing fields are cleared.
    const waypointsOnyxUpdate = Object.keys(waypoints).reduce(
        (acc, key) => {
            const waypoint = waypoints[key];
            acc[key] = {
                name: waypoint.name ?? null,
                address: waypoint.address ?? null,
                lat: waypoint.lat ?? null,
                lng: waypoint.lng ?? null,
                city: 'city' in waypoint ? (waypoint.city ?? null) : null,
                state: 'state' in waypoint ? (waypoint.state ?? null) : null,
                zipCode: 'zipCode' in waypoint ? (waypoint.zipCode ?? null) : null,
                country: 'country' in waypoint ? (waypoint.country ?? null) : null,
                street: 'street' in waypoint ? (waypoint.street ?? null) : null,
                street2: 'street2' in waypoint ? (waypoint.street2 ?? null) : null,
                pendingAction: 'pendingAction' in waypoint ? (waypoint.pendingAction ?? null) : null,
                keyForList: waypoint.keyForList ?? null,
            };
            return acc;
        },
        {} as Record<string, Required<NullishDeep<RecentWaypoint & Waypoint>>>,
    );

    return Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            waypoints: waypointsOnyxUpdate,
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
                distance: null,
                geometry: {
                    coordinates: null,
                },
            },
        },
    });
}

type DismissDuplicateTransactionViolationProps = {
    transactionIDs: string[];
    dismissedPersonalDetails: PersonalDetails;
    expenseReport: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    isASAPSubmitBetaEnabled: boolean;
    allTransactions: OnyxCollection<Transaction>;
};

/**
 * Dismisses the duplicate transaction violation for the provided transactionIDs
 * and updates the transaction to include the dismissed violation in the comment.
 */
function dismissDuplicateTransactionViolation({
    transactionIDs,
    dismissedPersonalDetails,
    expenseReport,
    policy,
    isASAPSubmitBetaEnabled,
    allTransactions,
}: DismissDuplicateTransactionViolationProps) {
    const currentTransactionViolations = transactionIDs.map((id) => ({transactionID: id, violations: allTransactionViolation?.[id] ?? []}));
    const currentTransactions = transactionIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
    const transactionsReportActions = currentTransactions.map((transaction) => getIOUActionForReportID(transaction?.reportID, transaction?.transactionID));
    const optimisticDismissedViolationReportActions = transactionsReportActions.map(() => {
        return buildOptimisticDismissedViolationReportAction({reason: 'manual', violationName: CONST.VIOLATIONS.DUPLICATED_TRANSACTION});
    });

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    if (expenseReport) {
        const hasOtherViolationsBesideDuplicates = currentTransactionViolations.some(
            ({violations}) => violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION).length,
        );
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const optimisticNextStepDeprecated = buildNextStepNew({
            report: expenseReport,
            predictedNextStatus: expenseReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
            shouldFixViolations: hasOtherViolationsBesideDuplicates,
            policy,
            currentUserAccountIDParam: dismissedPersonalDetails.accountID,
            currentUserEmailParam: dismissedPersonalDetails.login ?? '',
            hasViolations: hasOtherViolationsBesideDuplicates,
            isASAPSubmitBetaEnabled,
        });
        const optimisticNextStep = buildOptimisticNextStep({
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
            value: optimisticNextStepDeprecated,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: null,
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    const optimisticReportActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = transactionsReportActions.map((action, index) => {
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
    const optimisticDataTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = currentTransactionViolations.map((transactionViolations) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionViolations.transactionID}`,
        value: transactionViolations.violations?.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
    }));

    optimisticData.push(...optimisticDataTransactionViolations);
    optimisticData.push(...optimisticReportActions);

    const optimisticDataTransactions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = currentTransactions.map((transaction) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
        value: {
            ...transaction,
            comment: {
                ...transaction?.comment,
                dismissedViolations: {
                    duplicatedTransaction: {
                        [dismissedPersonalDetails.login ?? '']: getUnixTime(new Date()),
                    },
                },
            },
        },
    }));

    optimisticData.push(...optimisticDataTransactions);

    const failureDataTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = currentTransactionViolations.map((transactionViolations) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionViolations.transactionID}`,
        value: transactionViolations.violations?.map((violation) => violation),
    }));

    const failureDataTransaction: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = currentTransactions.map((transaction) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
        value: {
            ...transaction,
        },
    }));

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    const failureReportActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = transactionsReportActions.map((action, index) => {
        const optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.childReportID}`,
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

    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
    const successReportActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = transactionsReportActions.map((action, index) => {
        const optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${action?.childReportID}`,
            value: optimisticDismissedViolationReportAction
                ? {
                      [optimisticDismissedViolationReportAction.reportActionID]: null,
                  }
                : undefined,
        };
    });
    successData.push(...successReportActions);

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

function setReviewDuplicatesKey(values: Partial<ReviewDuplicates>) {
    Onyx.merge(`${ONYXKEYS.REVIEW_DUPLICATES}`, {
        ...values,
    });
}

function abandonReviewDuplicateTransactions() {
    Onyx.set(ONYXKEYS.REVIEW_DUPLICATES, null);
}

function clearError(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {errors: null, errorFields: {route: null, waypoints: null, routes: null}});
}

function getLastModifiedExpense(reportID?: string): OriginalMessageModifiedExpense | undefined {
    const modifiedExpenseActions = Object.values(getAllReportActions(reportID)).filter(isModifiedExpenseAction);
    modifiedExpenseActions.sort((a, b) => Number(a.reportActionID) - Number(b.reportActionID));
    return getOriginalMessage(modifiedExpenseActions.at(-1));
}

function revert(transaction?: OnyxEntry<Transaction>, originalMessage?: OriginalMessageModifiedExpense | undefined) {
    if (!transaction || !originalMessage?.oldAmount || !originalMessage.oldCurrency || !('amount' in originalMessage) || !('currency' in originalMessage)) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, {
        modifiedAmount: transaction?.amount && transaction?.amount < 0 ? -Math.abs(originalMessage.oldAmount) : originalMessage.oldAmount,
        modifiedCurrency: originalMessage.oldCurrency,
    });
}

function markAsCash(transactionID: string | undefined, transactionThreadReportID: string | undefined, transactionViolations: TransactionViolations = []) {
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
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        optimisticData: [
            // Optimistically dismissing the violation, removing it from the list of violations
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: transactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.RTER),
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
                value: transactionViolations,
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
    const onyxData: OnyxData<typeof ONYXKEYS.NVP_RECENT_WAYPOINTS> = {
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

/**
 * Returns a client generated 16 character hexadecimal value for the transactionID
 */
function generateTransactionID(): string {
    return NumberUtils.generateHexadecimalValue(16);
}

function setTransactionReport(transactionID: string, transaction: Partial<Transaction>, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
}

type ChangeTransactionsReportProps = {
    transactionIDs: string[];
    isASAPSubmitBetaEnabled: boolean;
    accountID: number;
    email: string;
    newReport?: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy>;
    reportNextStep?: OnyxEntry<ReportNextStepDeprecated>;
    policyCategories?: OnyxEntry<PolicyCategories>;
    allTransactions: OnyxCollection<Transaction>;
};

function changeTransactionsReport({
    transactionIDs,
    isASAPSubmitBetaEnabled,
    accountID,
    email,
    newReport,
    policy,
    reportNextStep,
    policyCategories,
    allTransactions,
}: ChangeTransactionsReportProps) {
    const reportID = newReport?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID;

    const transactions = transactionIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((t): t is NonNullable<typeof t> => t !== undefined);
    const transactionIDToReportActionAndThreadData: Record<string, TransactionThreadInfo> = {};
    const updatedReportTotals: Record<string, number> = {};
    const updatedReportNonReimbursableTotals: Record<string, number> = {};
    const updatedReportUnheldNonReimbursableTotals: Record<string, number> = {};

    // Store current violations for each transaction to restore on failure
    const currentTransactionViolations: Record<string, TransactionViolation[]> = {};
    for (const id of transactionIDs) {
        currentTransactionViolations[id] = allTransactionViolation?.[id] ?? [];
    }

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [];
    const successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    const existingSelfDMReportID = findSelfDMReportID();
    let selfDMReport: Report | undefined;
    let selfDMCreatedReportAction: ReportAction | undefined;

    if (!existingSelfDMReportID && reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
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
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                value: null,
            },
        );
    }

    let transactionsMoved = false;
    let shouldFixViolations = false;

    // TODO: Replace getPolicyTagsData with useOnyx hook (https://github.com/Expensify/App/issues/72720)
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policyTagList = getPolicyTagsData(policy?.id);
    const policyHasDependentTags = hasDependentTags(policy, policyTagList);

    // Determine the destination currency for convertedAmount clearing logic
    const destinationCurrency = newReport?.currency ?? policy?.outputCurrency;

    for (const transaction of transactions) {
        const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

        const selfDMReportID = existingSelfDMReportID ?? selfDMReport?.reportID;

        const oldIOUAction = getIOUActionForReportID(isUnreportedExpense ? selfDMReportID : transaction.reportID, transaction.transactionID);
        if (!transaction.reportID || transaction.reportID === reportID) {
            continue;
        }

        transactionsMoved = true;

        const oldReportID = isUnreportedExpense ? CONST.REPORT.UNREPORTED_REPORT_ID : transaction.reportID;
        const oldReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oldReportID}`];
        const sourceCurrency = oldReport?.currency;
        const shouldClearAmount = shouldClearConvertedAmount(transaction, sourceCurrency, destinationCurrency);

        const isUnreported = reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
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

        // 1. Optimistically change the reportID on the passed transactions
        // Only set pendingAction for transactions that need convertedAmount recalculation
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                reportID,
                ...(shouldClearAmount && {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                ...(isUnreported && {
                    comment: {
                        hold: null,
                    },
                }),
                ...(shouldClearAmount && {convertedAmount: null}),
                ...(oldIOUAction ? {linkedTrackedExpenseReportAction: newIOUAction} : {}),
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                reportID,
                ...(shouldClearAmount && {pendingAction: null}),
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                reportID: transaction.reportID,
                ...(shouldClearAmount && {pendingAction: transaction.pendingAction ?? null}),
                comment: {
                    hold: transaction.comment?.hold,
                },
                ...(shouldClearAmount && {convertedAmount: transaction.convertedAmount}),
            },
        });

        // Optimistically clear all violations for the transaction when moving to self DM report
        if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            const duplicateViolation = currentTransactionViolations?.[transaction.transactionID]?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
            const duplicateTransactionIDs = duplicateViolation?.data?.duplicates;
            if (duplicateTransactionIDs) {
                for (const id of duplicateTransactionIDs) {
                    optimisticData.push({
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
                        value: allTransactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
                    });
                }
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
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
        const targetReportID = isUnreported ? selfDMReportID : reportID;
        const {amount: transactionAmount = 0, currency: transactionCurrency} = getTransactionDetails(transaction, undefined, undefined, allowNegative) ?? {};
        const oldReportTotal = oldReport?.total ?? 0;
        const updatedReportTotal = transactionAmount < 0 ? oldReportTotal - transactionAmount : oldReportTotal + transactionAmount;

        if (oldReport && oldReport.currency === transactionCurrency) {
            updatedReportTotals[oldReportID] = updatedReportTotals[oldReportID] ? updatedReportTotals[oldReportID] : updatedReportTotal;
            updatedReportNonReimbursableTotals[oldReportID] =
                (updatedReportNonReimbursableTotals[oldReportID] ? updatedReportNonReimbursableTotals[oldReportID] : (oldReport?.nonReimbursableTotal ?? 0)) +
                (transaction?.reimbursable ? 0 : transactionAmount);
            updatedReportUnheldNonReimbursableTotals[oldReportID] =
                (updatedReportUnheldNonReimbursableTotals[oldReportID] ? updatedReportUnheldNonReimbursableTotals[oldReportID] : (oldReport?.unheldNonReimbursableTotal ?? 0)) +
                (transaction?.reimbursable && !isOnHold(transaction) ? 0 : transactionAmount);
        }

        if (targetReportID) {
            const targetReportKey = `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`;
            const targetReport =
                allReports?.[targetReportKey] ?? (targetReportID === newReport?.reportID ? newReport : undefined) ?? (targetReportID === selfDMReport?.reportID ? selfDMReport : undefined);

            if (transactionCurrency === targetReport?.currency) {
                const currentTotal = updatedReportTotals[targetReportID] ?? targetReport?.total ?? 0;
                updatedReportTotals[targetReportID] = currentTotal - transactionAmount;

                const currentNonReimbursableTotal = updatedReportNonReimbursableTotals[targetReportID] ?? targetReport?.nonReimbursableTotal ?? 0;
                updatedReportNonReimbursableTotals[targetReportID] = currentNonReimbursableTotal - (transactionReimbursable ? 0 : transactionAmount);

                const currentUnheldNonReimbursableTotal = updatedReportUnheldNonReimbursableTotals[targetReportID] ?? targetReport?.unheldNonReimbursableTotal ?? 0;
                updatedReportUnheldNonReimbursableTotals[targetReportID] = currentUnheldNonReimbursableTotal - (transactionReimbursable && !isOnHold(transaction) ? 0 : transactionAmount);
            } else if (transaction.convertedAmount && oldReport?.currency === targetReport?.currency) {
                // Use convertedAmount when transaction currency differs but workspace currency is the same
                const {convertedAmount} = transaction;
                const currentTotal = updatedReportTotals[targetReportID] ?? targetReport?.total ?? 0;
                updatedReportTotals[targetReportID] = currentTotal + convertedAmount;

                const currentNonReimbursableTotal = updatedReportNonReimbursableTotals[targetReportID] ?? targetReport?.nonReimbursableTotal ?? 0;
                updatedReportNonReimbursableTotals[targetReportID] = currentNonReimbursableTotal + (transactionReimbursable ? 0 : convertedAmount);

                const currentUnheldNonReimbursableTotal = updatedReportUnheldNonReimbursableTotals[targetReportID] ?? targetReport?.unheldNonReimbursableTotal ?? 0;
                updatedReportUnheldNonReimbursableTotals[targetReportID] = currentUnheldNonReimbursableTotal + (transactionReimbursable && !isOnHold(transaction) ? 0 : convertedAmount);
            }
        }

        // 4. Optimistically update the IOU action reportID
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

        const shouldRemoveOtherParticipants = !isManagedCardTransaction(transaction);
        const childReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${newIOUAction.childReportID}`];
        if (childReport) {
            const participants = childReport.participants;
            // 5. Optimistically update the transaction thread and all threads in the transaction thread
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${newIOUAction.childReportID}`,
                value: {
                    parentReportID: targetReportID,
                    parentReportActionID: optimisticMoneyRequestReportActionID,
                    policyID: reportID !== CONST.REPORT.UNREPORTED_REPORT_ID && newReport ? newReport.policyID : CONST.POLICY.ID_FAKE,
                    participants: isUnreported && shouldRemoveOtherParticipants ? {[accountID]: participants?.[accountID]} : participants,
                },
            });
        }

        if (oldIOUAction) {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${oldIOUAction.childReportID}`,
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                value: {
                    parentReportID: isUnreportedExpense ? selfDMReportID : oldReportID,
                    optimisticMoneyRequestReportActionID: oldIOUAction.reportActionID,
                    policyID: allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oldIOUAction.reportActionID}`]?.policyID,
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

        if (!existingSelfDMReportID && reportID === CONST.REPORT.UNREPORTED_REPORT_ID && selfDMReport && selfDMCreatedReportAction) {
            // Add self DM data to transaction data
            transactionIDToReportActionAndThreadData[transaction.transactionID] = {
                ...baseTransactionData,
                selfDMReportID: selfDMReport.reportID,
                selfDMCreatedReportActionID: selfDMCreatedReportAction.reportActionID,
            };
        } else {
            transactionIDToReportActionAndThreadData[transaction.transactionID] = baseTransactionData;
        }

        // Build unhold report action only when moving to unreported (self DM) report
        if (isUnreported && isOnHold(transaction)) {
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
    }

    if (!transactionsMoved) {
        return;
    }

    // 8. Update the report totals
    for (const [reportIDToUpdate, total] of Object.entries(updatedReportTotals)) {
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
    }

    for (const [reportIDToUpdate, total] of Object.entries(updatedReportNonReimbursableTotals)) {
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
    }

    for (const [reportIDToUpdate, total] of Object.entries(updatedReportUnheldNonReimbursableTotals)) {
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
    }

    const reportTransactions = getReportTransactions(reportID);
    for (const transaction of reportTransactions) {
        if (!isPaidGroupPolicy(policy) || !policy?.id) {
            continue;
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
    }

    // 9. Update next steps for all affected reports
    const destinationReportID = reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? (existingSelfDMReportID ?? selfDMReport?.reportID) : reportID;
    const affectedReportIDs = new Set<string>();

    for (const reportIDToUpdate of Object.keys(updatedReportTotals)) {
        affectedReportIDs.add(reportIDToUpdate);
    }

    if (destinationReportID) {
        affectedReportIDs.add(destinationReportID);
    }

    for (const affectedReportID of affectedReportIDs) {
        const affectedReport =
            allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${affectedReportID}`] ??
            (affectedReportID === newReport?.reportID ? newReport : undefined) ??
            (affectedReportID === selfDMReport?.reportID ? selfDMReport : undefined);

        if (!affectedReport) {
            continue;
        }

        const updatedTotal = updatedReportTotals[affectedReportID] ?? affectedReport.total;
        const updatedReport = {
            ...affectedReport,
            total: updatedTotal,
            reportID: affectedReport.reportID ?? affectedReportID,
        };

        const predictedNextStatus = updatedReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN;

        const hasViolations = hasViolationsReportUtils(updatedReport.reportID, allTransactionViolation, accountID, email ?? '');
        const isDestinationReport = affectedReportID === destinationReportID;
        const shouldFixViolationsForReport = isDestinationReport ? shouldFixViolations : false;
        const shouldUseUnreportedNextStepKey = reportID === CONST.REPORT.UNREPORTED_REPORT_ID && isDestinationReport;
        const nextStepOnyxReportID = shouldUseUnreportedNextStepKey ? reportID : affectedReportID;

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const optimisticNextStepForCollection = buildNextStepNew({
            report: updatedReport,
            policy,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            predictedNextStatus,
            shouldFixViolations: shouldFixViolationsForReport,
        });
        const optimisticNextStepForReport = buildOptimisticNextStep({
            report: updatedReport,
            policy,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            predictedNextStatus,
            shouldFixViolations: shouldFixViolationsForReport,
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${nextStepOnyxReportID}`,
            value: optimisticNextStepForCollection,
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${affectedReportID}`,
            value: {
                nextStep: optimisticNextStepForReport,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${affectedReportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${nextStepOnyxReportID}`,
            value: nextStepOnyxReportID === reportID ? reportNextStep : (affectedReport.nextStep ?? null),
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${affectedReportID}`,
            value: {
                nextStep: affectedReport.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

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

function getDuplicateTransactionDetails(transactionID?: string) {
    if (!transactionID) {
        return;
    }

    const parameters: GetDuplicateTransactionDetailsParams = {
        transactionID,
    };

    API.read(READ_COMMANDS.GET_DUPLICATE_TRANSACTION_DETAILS, parameters);
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
    sanitizeRecentWaypoints,
    getLastModifiedExpense,
    revert,
    changeTransactionsReport,
    setTransactionReport,
    getDuplicateTransactionDetails,
};
