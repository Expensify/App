type VirtualEmployeeCapability =
    | 'can_read_transactions'
    | 'can_edit_transactions'
    | 'can_send_messages'
    | 'can_approve_reports'
    | 'can_reject_reports'
    | 'can_dismiss_violations'
    | 'can_read_policy'
    | 'can_read_reports';

type VirtualEmployeeEventSubscription =
    | 'transaction.created'
    | 'transaction.modified'
    | 'transaction.receipt_scanned'
    | 'report.submitted'
    | 'report.approved'
    | 'chat.mention'
    | 'chat.message';

type VirtualEmployee = {
    id: string;
    policyID: string;
    accountID: number;
    email: string;
    displayName: string;
    systemPrompt: string;
    capabilities: VirtualEmployeeCapability[];
    eventSubs: VirtualEmployeeEventSubscription[];
    status: 'active' | 'paused' | 'deleted';
    createdBy: number;
    pendingAction?: 'add' | 'update' | 'delete';
    errors?: Record<string, string>;
};

export type {VirtualEmployee, VirtualEmployeeCapability, VirtualEmployeeEventSubscription};
