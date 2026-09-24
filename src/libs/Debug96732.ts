import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxKey, OnyxUpdate} from 'react-native-onyx';

import {format} from 'date-fns';
/**
 * TEMPORARY instrumentation for https://github.com/Expensify/App/issues/96732
 * ("Future date not allowed" briefly displays and disappears).
 *
 * Every line is printed as `[96732][<event>] {...json...}` on a single line so it can be filtered
 * with a plain text search in the browser console, Metro or `adb logcat`.
 *
 * What each event proves:
 *  - `compute`        - the client-side futureDate decision inside `ViolationsUtils.getViolationsOnyxData`.
 *                       Includes both the current `new Date(...)` + `isFutureDay` result and a
 *                       timezone-safe `yyyy-MM-dd` string comparison, so a disagreement between the two
 *                       exposes the UTC-midnight parsing bug.
 *  - `create-optimistic` - the violations array the create flow pushes to `optimisticData` (and the fact
 *                       that no `successData` re-asserts it).
 *  - `server`         - the raw `transactionViolations_*` payload the backend sent back, tagged with the
 *                       API command. This is the decisive one: it shows whether the server returns
 *                       `futureDate` at all, and for which dates.
 *  - `write`          - every net change to `transactionViolations_<id>` in Onyx, with before/after.
 *                       A `write` that drops `futureDate` with NO `compute` line immediately before it
 *                       means the removal came from the server, not from a client recompute.
 *
 * `dump96732()` and `dump96732('<transactionID>')` are exposed globally for on-demand inspection.
 *
 * Delete this file together with its call sites in `ViolationsUtils.ts`, `MoneyRequestBuilder.ts`
 * and `actions/OnyxUpdates.ts` once the root cause is confirmed.
 */
import Onyx from 'react-native-onyx';

/** Search for this string to find every line produced by this module */
const DEBUG_TAG = '[96732]';

/** `getViolationsOnyxData` runs on nearly every Onyx tick, so identical payloads are only printed once */
const lastPayloadByKey = new Map<string, string>();

/** Previous value of every `transactionViolations_*` key, so writes can be logged as before -> after */
const lastViolationsByTransactionID = new Map<string, string[]>();

/** Latest transaction collection, used to enrich violation writes with the expense date */
let lastTransactions: OnyxCollection<Transaction>;

function print(event: string, dedupeKey: string, payload: Record<string, unknown>, shouldDedupe = true) {
    const serialized = JSON.stringify(payload);
    const key = `${event}:${dedupeKey}`;
    if (shouldDedupe && lastPayloadByKey.get(key) === serialized) {
        return;
    }
    lastPayloadByKey.set(key, serialized);
    // eslint-disable-next-line no-console -- temporary debugging output for issue #96732
    console.log(`${DEBUG_TAG}[${event}] ${serialized}`);
}

function hasFutureDate(violations: TransactionViolations | undefined): boolean {
    return !!violations?.some((violation) => violation.name === CONST.VIOLATIONS.FUTURE_DATE);
}

function violationNames(violations: TransactionViolations | undefined): string[] {
    return (violations ?? []).map((violation) => violation.name);
}

/** The date the app is actually using for this expense, mirroring `TransactionUtils.getCreated` */
function getEffectiveCreated(transaction: OnyxEntryLike<Transaction>): string {
    return transaction?.modifiedCreated ? transaction.modifiedCreated : (transaction?.created ?? '');
}

type OnyxEntryLike<T> = T | undefined | null;

function summarizeTransactionDates(transaction: OnyxEntryLike<Transaction>) {
    if (!transaction) {
        return null;
    }
    return {
        transactionID: transaction.transactionID,
        reportID: transaction.reportID,
        created: transaction.created,
        // Empty string here is what breaks `modifiedCreated ?? created` in ViolationsUtils
        modifiedCreated: transaction.modifiedCreated,
        modifiedCreatedIsEmptyString: transaction.modifiedCreated === '',
        effectiveCreated: getEffectiveCreated(transaction),
        merchant: transaction.modifiedMerchant ?? transaction.merchant,
        amount: transaction.modifiedAmount ?? transaction.amount,
        pendingAction: transaction.pendingAction,
    };
}

type FutureDateComputeParams = {
    /** Where the compute was triggered from, e.g. `create` or `edit` */
    caller: string;
    transaction: OnyxEntryLike<Transaction>;
    policyType: string | undefined;
    policyID: string | undefined;
    isInvoiceTransaction: boolean;
    isControlPolicy: boolean;
    /** The `new Date(modifiedCreated ?? created)` value ViolationsUtils actually built */
    inputDate: Date;
    /** Result of `DateUtils.isFutureDay(inputDate)` */
    isFutureDayResult: boolean;
    shouldDisplayFutureDateViolation: boolean;
    /** Whether the incoming violations array already had `futureDate` */
    hadFutureDateViolation: boolean;
    violationsIn: TransactionViolations;
    violationsOut: TransactionViolations;
};

/**
 * Logs the client-side futureDate decision. The two `isFuture*` fields are computed independently:
 * when `isFutureDayResult` and `isFutureByStringCompare` disagree, the UTC-midnight parse in
 * `ViolationsUtils.ts` is the reason the violation is missing (or present) for that user's timezone.
 */
function logFutureDateCompute({
    caller,
    transaction,
    policyType,
    policyID,
    isInvoiceTransaction,
    isControlPolicy,
    inputDate,
    isFutureDayResult,
    shouldDisplayFutureDateViolation,
    hadFutureDateViolation,
    violationsIn,
    violationsOut,
}: FutureDateComputeParams) {
    const effectiveCreated = getEffectiveCreated(transaction);
    const todayLocal = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const inputDateIsValid = !Number.isNaN(inputDate.getTime());

    print('compute', transaction?.transactionID ?? 'unknown', {
        caller,
        transactionID: transaction?.transactionID,
        policyID,
        policyType,
        isControlPolicy,
        isInvoiceTransaction,

        // --- date inputs ---
        created: transaction?.created,
        modifiedCreated: transaction?.modifiedCreated,
        modifiedCreatedIsEmptyString: transaction?.modifiedCreated === '',
        effectiveCreated,

        // --- how ViolationsUtils reads that date today ---
        inputDateIsValid,
        inputDateISO: inputDateIsValid ? inputDate.toISOString() : 'Invalid Date',
        isFutureDayResult,

        // --- timezone-safe comparison for reference ---
        todayLocal,
        isFutureByStringCompare: !!effectiveCreated && effectiveCreated > todayLocal,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
        // true => the current implementation and a plain calendar-date compare disagree
        timezoneParsingMismatch: isFutureDayResult !== (!!effectiveCreated && effectiveCreated > todayLocal),

        // --- decision ---
        shouldDisplayFutureDateViolation,
        hadFutureDateViolation,
        violationsIn: violationNames(violationsIn),
        violationsOut: violationNames(violationsOut),
        futureDateInResult: hasFutureDate(violationsOut),
    });
}

/**
 * Logs the violations array the create flow writes to `optimisticData`. `hasSuccessDataForViolations`
 * is expected to be false - that is the gap this issue is about.
 */
function logCreateOptimisticViolations(transaction: OnyxEntryLike<Transaction>, violations: unknown, hasSuccessDataForViolations: boolean) {
    const violationList = Array.isArray(violations) ? (violations as TransactionViolations) : undefined;
    print(
        'create-optimistic',
        transaction?.transactionID ?? 'unknown',
        {
            transactionID: transaction?.transactionID,
            transaction: summarizeTransactionDates(transaction),
            onyxMethod: 'SET',
            optimisticViolations: violationNames(violationList),
            futureDateInOptimistic: hasFutureDate(violationList),
            // If this is false, nothing re-asserts the violation after the API responds
            hasSuccessDataForViolations,
        },
        false,
    );
}

/**
 * Logs every `transactionViolations_*` payload the backend sends, tagged with the API command that
 * produced it. This is what tells us whether the server computes `futureDate` at all.
 */
function logServerViolations<TKey extends OnyxKey>(source: string, command: string, updates: Array<OnyxUpdate<TKey>> | undefined) {
    if (!updates?.length) {
        return;
    }
    for (const update of updates) {
        const key = (update as {key?: string}).key ?? '';
        if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS)) {
            continue;
        }
        const transactionID = key.slice(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS.length);
        const value = (update as {value?: unknown}).value;
        const violations = Array.isArray(value) ? (value as TransactionViolations) : undefined;
        print(
            'server',
            transactionID,
            {
                source,
                command,
                transactionID,
                onyxMethod: (update as {onyxMethod?: string}).onyxMethod,
                serverViolations: violations ? violationNames(violations) : value,
                futureDateFromServer: hasFutureDate(violations),
                transaction: summarizeTransactionDates(lastTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]),
            },
            false,
        );
    }
}

/** Logs the raw onyxData a WRITE response carried, so we can see the server's transaction payload too */
function logServerTransactionDates<TKey extends OnyxKey>(source: string, command: string, updates: Array<OnyxUpdate<TKey>> | undefined) {
    if (!updates?.length) {
        return;
    }
    for (const update of updates) {
        const key = (update as {key?: string}).key ?? '';
        if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) || key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS)) {
            continue;
        }
        const value = (update as {value?: unknown}).value as Transaction | undefined;
        if (!value || (value.created === undefined && value.modifiedCreated === undefined)) {
            continue;
        }
        print(
            'server-transaction',
            key,
            {
                source,
                command,
                key,
                onyxMethod: (update as {onyxMethod?: string}).onyxMethod,
                created: value.created,
                modifiedCreated: value.modifiedCreated,
                modifiedCreatedIsEmptyString: value.modifiedCreated === '',
            },
            false,
        );
    }
}

// We use `connectWithoutView` because this module is pure instrumentation and renders nothing.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (transactions) => {
        lastTransactions = transactions;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    callback: (violationsCollection) => {
        for (const [collectionKey, violations] of Object.entries(violationsCollection ?? {})) {
            const transactionID = collectionKey.slice(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS.length);
            const after = violationNames(violations);
            const before = lastViolationsByTransactionID.get(transactionID);
            if (before && JSON.stringify(before) === JSON.stringify(after)) {
                continue;
            }
            lastViolationsByTransactionID.set(transactionID, after);

            const hadFutureDate = !!before?.includes(CONST.VIOLATIONS.FUTURE_DATE);
            const hasFutureDateNow = after.includes(CONST.VIOLATIONS.FUTURE_DATE);

            let verdict = 'UNCHANGED_FUTURE_DATE';
            if (!hadFutureDate && hasFutureDateNow) {
                verdict = 'FUTURE_DATE_ADDED';
            } else if (hadFutureDate && !hasFutureDateNow) {
                // This is the disappearing red brick road. Check whether a `compute` line was printed
                // immediately before it - if not, the removal came from the server payload.
                verdict = 'FUTURE_DATE_REMOVED';
            }

            print(
                'write',
                transactionID,
                {
                    transactionID,
                    verdict,
                    before: before ?? null,
                    after,
                    transaction: summarizeTransactionDates(lastTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]),
                },
                false,
            );
        }

        // A deleted collection member produces no entry above, so removals are detected by diffing the keys.
        // `transactionViolations_<id>: null` from the server lands here.
        for (const [transactionID, before] of lastViolationsByTransactionID.entries()) {
            if (violationsCollection?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]) {
                continue;
            }
            lastViolationsByTransactionID.delete(transactionID);

            print(
                'write',
                transactionID,
                {
                    transactionID,
                    verdict: before.includes(CONST.VIOLATIONS.FUTURE_DATE) ? 'FUTURE_DATE_REMOVED_BY_KEY_DELETE' : 'KEY_DELETED',
                    before,
                    after: null,
                    transaction: summarizeTransactionDates(lastTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]),
                },
                false,
            );
        }
    },
});

/**
 * Call `dump96732()` in the console for every transaction that currently has violations, or
 * `dump96732('<transactionID>')` for a single expense.
 */
function dump96732(transactionID?: string) {
    const todayLocal = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);

    if (transactionID) {
        const transaction = lastTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        const violations = lastViolationsByTransactionID.get(transactionID);
        print(
            'dump',
            transactionID,
            {
                todayLocal,
                timezoneOffsetMinutes: new Date().getTimezoneOffset(),
                transaction: summarizeTransactionDates(transaction),
                currentViolations: violations ?? null,
            },
            false,
        );
        return;
    }

    const entries = [...lastViolationsByTransactionID.entries()].map(([id, violations]) => ({
        transactionID: id,
        violations,
        transaction: summarizeTransactionDates(lastTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]),
    }));

    print(
        'dump',
        'overview',
        {
            todayLocal,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            trackedTransactionCount: entries.length,
            withFutureDate: entries.filter((entry) => entry.violations.includes(CONST.VIOLATIONS.FUTURE_DATE)).map((entry) => entry.transactionID),
            entries,
        },
        false,
    );
}

Object.assign(globalThis, {dump96732});

export {dump96732, logCreateOptimisticViolations, logFutureDateCompute, logServerTransactionDates, logServerViolations};
export type {TransactionViolation};
