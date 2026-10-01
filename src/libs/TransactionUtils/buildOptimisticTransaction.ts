/**
 * Builds the optimistic Transaction written to Onyx when an expense is created, before the server responds.
 * Extracted from TransactionUtils/index.ts to keep that file smaller.
 */
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Attendee, Participant, SplitExpense} from '@src/types/onyx/IOU';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {Comment, Receipt, Routes, TransactionCustomUnit, TransactionPendingFieldsKey, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import lodashSet from 'lodash/set';

// This cycle import is safe because this file was extracted from TransactionUtils/index.ts, which re-exports it.
// The functions imported here are pure helpers that aren't called at initialization time.
// eslint-disable-next-line import/no-cycle
import {isManualDistanceRequest, isOdometerDistanceRequest} from './index';

type TransactionParams = {
    /** Amount of the transaction, in cents */
    amount: number;

    modifiedAmount?: number;
    modifiedMerchant?: string;
    currency: string;
    reportID: string | undefined;
    comment?: string;
    attendees?: Attendee[];
    created?: string;
    merchant?: string;
    receipt?: OnyxEntry<Receipt>;

    /** Receipt scan state for the optimistic transaction. Falls back to `receipt.state` when not set. */
    receiptState?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    taxValue?: string;
    billable?: boolean;
    pendingFields?: Partial<Record<TransactionPendingFieldsKey, ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>>>;
    reimbursable?: boolean;
    source?: string;
    filename?: string;
    customUnit?: TransactionCustomUnit;
    splitExpenses?: SplitExpense[];
    splitExpensesTotal?: number;
    participants?: Participant[];
    pendingAction?: PendingAction;
    splitsStartDate?: string;
    splitsEndDate?: string;
    distance?: number;
    customUnitRateID?: string;
    waypoints?: WaypointCollection;
    odometerStart?: number;
    odometerEnd?: number;
    routes?: Routes;
    gpsCoordinates?: string;
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;
    count?: number;
    rate?: number;
    unit?: ValueOf<typeof CONST.TIME_TRACKING.UNIT>;
    commentType?: ValueOf<typeof CONST.TRANSACTION.TYPE>;
};

type BuildOptimisticTransactionParams = {
    originalTransactionID?: string;

    /** Reuse this ID when a distance expense already created an empty transaction */
    existingTransactionID?: string;

    existingTransaction?: OnyxEntry<Transaction>;
    policy?: OnyxEntry<Policy>;
    transactionParams: TransactionParams;
    isDemoTransactionParam?: boolean;
};

/**
 * Optimistically generate a transaction.
 */
function buildOptimisticTransaction(params: BuildOptimisticTransactionParams): Transaction {
    const {originalTransactionID = '', existingTransactionID, existingTransaction, policy, transactionParams, isDemoTransactionParam} = params;
    const {
        amount,
        modifiedAmount,
        modifiedMerchant,
        currency,
        reportID,
        distance,
        comment = '',
        attendees = [],
        created = '',
        merchant = '',
        receipt,
        receiptState,
        // Prevent RBR flip and transaction jump: initialize category to 'Uncategorized' instead of
        // empty string so optimistic missing category violation isn't added then removed during backend sync
        category = CONST.SEARCH.CATEGORY_DEFAULT_VALUE,
        tag = '',
        taxCode = '',
        taxAmount = 0,
        taxValue,
        billable = false,
        pendingFields,
        reimbursable = true,
        source = '',
        filename = '',
        customUnit,
        splitExpenses,
        splitsStartDate,
        splitsEndDate,
        splitExpensesTotal,
        participants,
        pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        customUnitRateID,
        waypoints,
        odometerStart,
        odometerEnd,
        routes,
        type,
        count,
        rate,
        unit,
        commentType,
    } = transactionParams;
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = existingTransactionID ?? rand64();

    const commentJSON: Comment = {comment, attendees};
    if (odometerStart !== undefined) {
        commentJSON.odometerStart = odometerStart;
    }
    if (odometerEnd !== undefined) {
        commentJSON.odometerEnd = odometerEnd;
    }
    if (isDemoTransactionParam) {
        commentJSON.isDemoTransaction = true;
    }
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }
    if (splitExpenses) {
        commentJSON.splitExpenses = splitExpenses;
    }
    if (splitsStartDate) {
        commentJSON.splitsStartDate = splitsStartDate;
    }
    if (splitsEndDate) {
        commentJSON.splitsEndDate = splitsEndDate;
    }
    if (splitExpensesTotal) {
        commentJSON.splitExpensesTotal = splitExpensesTotal;
    }
    if (waypoints) {
        commentJSON.waypoints = waypoints;
    }
    if (commentType) {
        commentJSON.type = commentType;
    }

    const isMapDistanceTransaction = !!pendingFields?.waypoints || existingTransaction?.comment?.waypoints?.waypoint0;
    const isManualDistanceTransaction = isManualDistanceRequest(existingTransaction);
    const isOdometerDistanceTransaction = isOdometerDistanceRequest(existingTransaction);
    if (isMapDistanceTransaction || isManualDistanceTransaction || isOdometerDistanceTransaction) {
        // If customUnit is provided (e.g., for split expenses), use it directly
        // Otherwise, build customUnit from distance parameter
        if (customUnit) {
            lodashSet(commentJSON, 'customUnit', customUnit);
        } else {
            const routeDistanceMeters = routes?.route0?.distance ?? existingTransaction?.routes?.route0?.distance;
            lodashSet(commentJSON, 'customUnit', {...existingTransaction?.comment?.customUnit});
            // Set the distance unit, which comes from the policy distance unit or the P2P rate data
            lodashSet(commentJSON, 'customUnit.distanceUnit', DistanceRequestUtils.getUpdatedDistanceUnit({transaction: existingTransaction, policy}));
            lodashSet(commentJSON, 'customUnit.quantity', distance);
            if (customUnitRateID) {
                lodashSet(commentJSON, 'customUnit.customUnitRateID', customUnitRateID);
            }
            lodashSet(commentJSON, 'customUnit.name', existingTransaction?.comment?.customUnit?.name ?? CONST.CUSTOM_UNITS.NAME_DISTANCE);
            if (typeof routeDistanceMeters === 'number') {
                lodashSet(commentJSON, 'customUnit.routeDistanceMeters', routeDistanceMeters);
            }
        }
    }

    const isPerDiemTransaction = !!pendingFields?.subRates;
    if (isPerDiemTransaction) {
        // Set the custom unit, which comes from the policy per diem rate data
        lodashSet(commentJSON, 'customUnit', customUnit);
    }

    const isManualTransaction = !isPerDiemTransaction && !isMapDistanceTransaction && !isManualDistanceTransaction && !splitExpenses && !receipt?.source;
    if (type === CONST.TRANSACTION.TYPE.TIME) {
        commentJSON.units = {
            count,
            rate,
            unit,
        };
        commentJSON.type = type;
    }

    return {
        ...(!isEmptyObject(pendingFields) ? {pendingFields} : {}),
        transactionID,
        amount,
        currency,
        reportID,
        comment: commentJSON,
        merchant: merchant || (isManualTransaction ? CONST.TRANSACTION.DEFAULT_MERCHANT : CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT),
        created: created || DateUtils.getDBTime(),
        pendingAction,
        receipt: receipt?.source
            ? {
                  source: receipt.source,
                  filename: receipt?.name ?? filename,
                  state: receiptState ?? receipt.state ?? CONST.IOU.RECEIPT_STATE.SCAN_READY,
                  isTestDriveReceipt: receipt.isTestDriveReceipt,
                  pageCount: receipt.pageCount,
              }
            : undefined,
        hasEReceipt: existingTransaction?.hasEReceipt,
        category,
        tag,
        taxCode,
        taxAmount,
        taxValue,
        modifiedAmount,
        modifiedMerchant,
        billable,
        reimbursable,
        inserted: DateUtils.getDBTime(),
        participants,
        cardID: existingTransaction?.cardID,
        cardName: existingTransaction?.cardName,
        cardNumber: existingTransaction?.cardNumber,
        ...(existingTransaction?.iouRequestType ? {iouRequestType: existingTransaction.iouRequestType} : {}),
        // Splits rebuild this expense without a policy. A missing policy would otherwise read as enabled and erase a recorded false.
        wasAutoCategorizeEnabledOnCreation: policy ? policy.autoCategorizeNewExpenses !== false : existingTransaction?.wasAutoCategorizeEnabledOnCreation !== false,
        routes,
    };
}

export default buildOptimisticTransaction;
