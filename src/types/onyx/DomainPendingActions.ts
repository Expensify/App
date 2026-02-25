import type * as OnyxCommon from './OnyxCommon';

/**
 * General pending action structure for domain members and admins
 * Pending actions structure is dictated by how `domain_` updates are handled in the app to prevent them from resetting unintentionally.
 */
type GeneralDomainMemberPendingAction = {
    /**
     * Base pending actions
     */
    pendingAction?: OnyxCommon.PendingAction;
};

/**
 * Pending actions structure for domain members
 */
type DomainMemberPendingActions = GeneralDomainMemberPendingAction & {
    /**
     * Pending action related to a specific domain vacation delegate
     */
    vacationDelegate?: OnyxCommon.PendingAction;

    /** Pending action for the list of emails exempt from the 2FA requirement */
    twoFactorAuthExemptEmails?: OnyxCommon.PendingAction;
};

/**
 * Pending actions triggered by user operations on the domain
 */
type DomainPendingAction = {
    /**
     * Pending actions for specific administrators, keyed by their accountID
     */
    admin?: Record<number, GeneralDomainMemberPendingAction>;

    /**
     * Pending action for the technical contact email
     */
    technicalContactEmail?: OnyxCommon.PendingAction;

    /**
     * Pending action for the "use technical contact billing card" setting
     */
    useTechnicalContactBillingCard?: OnyxCommon.PendingAction;

    /**
     * Pending actions for specific domain member, keyed by their email
     */
    member?: Record<string | number, DomainMemberPendingActions>;

    /**
     * Pending action for the 2FA toggle
     */
    twoFactorAuthRequired?: OnyxCommon.PendingAction;

    /**
     * Pending action for the domain itself
     */
    pendingAction?: OnyxCommon.PendingAction;
};

export type {GeneralDomainMemberPendingAction};
export default DomainPendingAction;
