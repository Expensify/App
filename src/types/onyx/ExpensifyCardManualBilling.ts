/** A partial settlement an admin queued for the next billing run */
type QueuedPartialExpensifyCardSettlement = {
    /** Marks the queued settlement as partial, a full settlement is the string "true" instead */
    type: 'partial';

    /** The amount that will be billed, in cents, rounded up from what the admin entered to whole transactions */
    amount: number;
};

/**
 * What was queued for the next Expensify Card billing run. The backend sends the string "true" for a full settlement
 * (older values can also be a boolean) and an object for a partial one; an empty value means nothing is queued.
 */
type ExpensifyCardManualBilling = boolean | string | QueuedPartialExpensifyCardSettlement;

export default ExpensifyCardManualBilling;
