import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

/**
 * Whether the route of a distance expense failed. The stored receipt then describes a different trip, or the
 * server never built one. This covers the route only, because `transaction.errors` also carries failures that
 * say nothing about the receipt, such as a failed payment or an invalid rate.
 *
 * Kept in its own file because TransactionUtils/index.ts is at its max-lines limit.
 */
function hasDistanceRouteErrors(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
}

export default hasDistanceRouteErrors;
