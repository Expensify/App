import type CONST from '@src/CONST';
import type {ChangeFieldParams, ExportedToIntegrationParams, IntegrationsMessageParams, MarkReimbursedFromIntegrationParams, ShareParams, UnshareParams} from '@src/languages/params';

import type {ValueOf} from 'type-fest';

/**
 *
 */
type OriginalMessageChangeField = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD;
    /**
     *
     */
    originalMessage: Record<string, unknown> & ChangeFieldParams;
};

// Currently lacking Params
// type OriginalMessageChangeType = {
//     /**
//      *
//      */
//     actionName: typeof CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE;
//     /**
//      *
//      */
//     originalMessage: ChangeTypeParams & Record<string, unknown>;
// };

/**
 *
 */
type OriginalMessageExportedToCSV = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageExportedToIntegration = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION;
    /**
     *
     */
    originalMessage: ExportedToIntegrationParams & Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageIntegrationsMessage = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE;
    /**
     *
     */
    originalMessage: IntegrationsMessageParams & Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageManagerAttachReceipt = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageManagerDetachReceipt = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

// Currently lacking Params
// type OriginalMessageMarkedReimbursed = {
//     /**
//      *
//      */
//     actionName: typeof CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED;
//     /**
//      *
//      */
//     originalMessage: MarkedReimbursedParams & Record<string, unknown>;
// };

/**
 *
 */
type OriginalMessageMarkReimbursedFromIntegration = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION;
    /**
     *
     */
    originalMessage: MarkReimbursedFromIntegrationParams & Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageOutdatedBankAccount = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type ReimbursementACHBounceOriginalMessage = {
    /**
     *
     */
    returnReason?: string;
};

/**
 *
 */
type OriginalMessageReimbursementACHBounce = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE;
    /**
     *
     */
    originalMessage: Record<string, unknown> & ReimbursementACHBounceOriginalMessage;
};

/**
 *
 */
type OriginalMessageReimbursementACHCancelled = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageReimbursementAccountChanged = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/** Fields Wise adds to REIMBURSEMENT_DELAYED for estimate changes and late completions */
type ReimbursementDelayedOriginalMessage = {
    /**
     * New delivery estimate of a Wise reimbursement, or the date it landed when `completed` is true. Absent when the
     * delay comes from our fraud review hold, which has no estimate.
     */
    expectedDate?: string;

    /** Delivery estimate before this update, so an earlier `expectedDate` can be announced as good news */
    previousExpectedDate?: string;

    /** True when a Wise deposit we reported as delayed or bounced completed after all */
    completed?: boolean;
};

/**
 *
 */
type OriginalMessageReimbursementDelayed = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED;
    /**
     *
     */
    originalMessage: Record<string, unknown> & ReimbursementDelayedOriginalMessage;
};

/** Fields Auth sends on a failed Wise deposit */
type ReimbursementDepositFailedOriginalMessage = {
    /**
     * Wise payout `failure_reason_code`, see `CONST.WISE.PAYOUT_FAILURE_REASON`. It can arrive after the action
     * is created, because Auth fills it in when Wise's payout failure webhook lands.
     */
    reason?: string;
};

/** Wise could not deposit a reimbursement into the recipient's bank account */
type OriginalMessageReimbursementDepositFailed = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEPOSIT_FAILED;
    originalMessage: Record<string, unknown> & ReimbursementDepositFailedOriginalMessage;
};

/** Wise is holding a reimbursement for review before sending it */
type OriginalMessageReimbursementHeld = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_HELD;
    originalMessage: Record<string, unknown>;
};

/** Fields Auth sends when Wise returns a reimbursement to the payer */
type ReimbursementRefundedOriginalMessage = {
    /** Amount returned to the payer */
    amount?: number;

    /** ISO 4217 currency code of `amount` */
    currency?: string;

    /** Last four digits of the payer's bank account the funds went back to */
    debitBankAccountLast4?: string;
};

/** Wise returned a reimbursement to the payer's bank account */
type OriginalMessageReimbursementRefunded = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REFUNDED;
    originalMessage: Record<string, unknown> & ReimbursementRefundedOriginalMessage;
};

/** Wise released a held reimbursement and resumed the payment */
type OriginalMessageReimbursementReleased = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_RELEASED;
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageSelectedForRandomAudit = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageShare = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.SHARE;
    /**
     *
     */
    originalMessage: ShareParams & Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageUnshare = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.UNSHARE;
    /**
     *
     */
    originalMessage: UnshareParams & Record<string, unknown>;
};

// Currently lacking Params
// type OriginalMessageStripePaid = {
//     /**
//      *
//      */
//     actionName: typeof CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID;
//     /**
//      *
//      */
//     originalMessage: StripePaidParams & Record<string, unknown>;
// };

/**
 *
 */
type OriginalMessageTakeControl = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

// Currently lacking Params
// type OriginalMessageUnapproved = {
//     /**
//      *
//      */
//     actionName: typeof CONST.REPORT.ACTIONS.TYPE.UNAPPROVED;
//     /**
//      *
//      */
//     originalMessage: UnapprovedParams & Record<string, unknown>;
// };

/**
 *
 */
type OldDotOriginalMessageMap = {
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD]: OriginalMessageChangeField;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV]: OriginalMessageExportedToCSV;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION]: OriginalMessageExportedToIntegration;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE]: OriginalMessageIntegrationsMessage;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT]: OriginalMessageManagerAttachReceipt;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT]: OriginalMessageManagerDetachReceipt;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION]: OriginalMessageMarkReimbursedFromIntegration;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT]: OriginalMessageOutdatedBankAccount;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE]: OriginalMessageReimbursementACHBounce;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED]: OriginalMessageReimbursementACHCancelled;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED]: OriginalMessageReimbursementAccountChanged;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED]: OriginalMessageReimbursementDelayed;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEPOSIT_FAILED]: OriginalMessageReimbursementDepositFailed;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_HELD]: OriginalMessageReimbursementHeld;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REFUNDED]: OriginalMessageReimbursementRefunded;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_RELEASED]: OriginalMessageReimbursementReleased;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT]: OriginalMessageSelectedForRandomAudit;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.SHARE]: OriginalMessageShare;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.UNSHARE]: OriginalMessageUnshare;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL]: OriginalMessageTakeControl;
};

/**
 *
 */
type OldDotAction = ValueOf<OldDotOriginalMessageMap>;

export default OldDotAction;
export type {OldDotOriginalMessageMap, OriginalMessageExportedToIntegration};
