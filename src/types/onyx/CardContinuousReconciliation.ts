import type {PendingAction} from './OnyxCommon';

/** Represents the continuous reconciliation status for a card. */
type CardContinuousReconciliation = {
    /** The boolean value indicating if continuous reconciliation is enabled */
    value: boolean;

    /** Pending action for optimistic UI updates */
    pendingAction?: PendingAction;
};

export default CardContinuousReconciliation;
