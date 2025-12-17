import type * as OnyxCommon from './OnyxCommon';

/**
 * Pending actions triggered by user operations on the domain
 */
type DomainPendingAction = {
    /**
     * Pending actions for specific administrators, keyed by their accountID
     */
    admin?: Record<
        number,
        {
            /**
             *
             */
            pendingAction: OnyxCommon.PendingAction;
        }
    >;
};

export default DomainPendingAction;
