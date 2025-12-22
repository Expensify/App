import type * as OnyxCommon from './OnyxCommon';

/**
 * Pending actions triggered by user operations on the domain
 */
type DomainPendingAction = {
    /**
     * Pending action for the technical contact email
     */
    technicalContactEmail?: OnyxCommon.PendingAction;

    /**
     * Pending actions for specific member, keyed by their accountID
     */
    member?: Record<number, OnyxCommon.PendingAction>;
};

export default DomainPendingAction;
