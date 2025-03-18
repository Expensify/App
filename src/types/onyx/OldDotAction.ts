import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {
    ChangeFieldParams,
    DelegateSubmitParams,
    ExportedToIntegrationParams,
    IntegrationsMessageParams,
    MarkReimbursedFromIntegrationParams,
    ShareParams,
    UnshareParams,
} from '@src/languages/params';

/**
 *
 */
type OldDotOriginalMessageActionName =
    | 'CHANGEFIELD'
    | 'CHANGEPOLICY'
    | 'CHANGETYPE'
    | 'DELEGATESUBMIT'
    | 'EXPORTCSV'
    | 'EXPORTINTEGRATION'
    | 'INTEGRATIONSMESSAGE'
    | 'MANAGERATTACHRECEIPT'
    | 'MANAGERDETACHRECEIPT'
    | 'MARKEDREIMBURSED'
    | 'MARKREIMBURSEDFROMINTEGRATION'
    | 'OUTDATEDBANKACCOUNT'
    | 'REIMBURSEMENTACHBOUNCE'
    | 'REIMBURSEMENTACHCANCELLED'
    | 'REIMBURSEMENTACCOUNTCHANGED'
    | 'REIMBURSEMENTDELAYED'
    | 'SELECTEDFORRANDOMAUDIT'
    | 'SHARE'
    | 'STRIPEPAID'
    | 'TAKECONTROL'
    | 'UNAPPROVED'
    | 'UNSHARE';

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
type OriginalMessageDelegateSubmit = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT;
    /**
     *
     */
    originalMessage: DelegateSubmitParams & Record<string, unknown>;
};

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
type OriginalMessageReimbursementACHBounce = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE;
    /**
     *
     */
    originalMessage: Record<string, unknown>;
};

/**
 *
 */
type OriginalMessageReimbursementACHCancelled = {
    /**
     *
     */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED;
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
    [CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT]: OriginalMessageDelegateSubmit;
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
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED]: OriginalMessageReimbursementACHCancelled;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED]: OriginalMessageReimbursementAccountChanged;
    /**
     *
     */
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED]: OriginalMessageReimbursementDelayed;
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
type OldDotLegacyMessage = {
    /**
     *
     */
    html?: string;
    /**
     *
     */
    text?: string;
};

/**
 *
 */
type OldDotLegacyAction = {
    /**
     *
     */
    message: OldDotLegacyMessage[] | OldDotLegacyMessage;
};

/**
 *
 */
type OldDotAction = ValueOf<OldDotOriginalMessageMap>;

export default OldDotAction;
export type {
    OriginalMessageChangeField,
    OldDotOriginalMessageActionName,
    OriginalMessageDelegateSubmit,
    OriginalMessageExportedToCSV,
    OriginalMessageExportedToIntegration,
    OriginalMessageIntegrationsMessage,
    OriginalMessageManagerAttachReceipt,
    OriginalMessageManagerDetachReceipt,
    OriginalMessageMarkReimbursedFromIntegration,
    OriginalMessageOutdatedBankAccount,
    OriginalMessageReimbursementACHBounce,
    OriginalMessageReimbursementACHCancelled,
    OriginalMessageReimbursementAccountChanged,
    OriginalMessageReimbursementDelayed,
    OriginalMessageSelectedForRandomAudit,
    OriginalMessageShare,
    OriginalMessageUnshare,
    OriginalMessageTakeControl,
    OldDotOriginalMessageMap,
    OldDotLegacyAction,
};
