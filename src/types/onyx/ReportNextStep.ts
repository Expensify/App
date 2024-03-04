type Message = {
    text: string;
    type?: string;
    action?: string;
};

type DataOptions = {
    canSeeACHOption?: boolean;
    isManualReimbursementEnabled?: boolean;
    maskedLockedAccountNumber?: string;
    preferredWithdrawalDeleted?: boolean;
};

type Button = {
    text?: string;
    tooltip?: string;
    disabled?: boolean;
    hidden?: boolean;
    data?: DataOptions;
};

type ReportNextStep = {
    /** The message parts of the next step */
    message?: Message[];

    /** The title for the next step */
    title?: string;

    /** Whether the user should take some sort of action in order to unblock the report */
    requiresUserAction?: boolean;

    /** The type of next step */
    type: 'alert' | 'neutral' | null;

    /** If the "Undo submit" button should be visible */
    showUndoSubmit?: boolean;

    /** Deprecated - If the next step should be displayed on mobile, related to OldApp */
    showForMobile?: boolean;

    /** If the next step should be displayed at the expense level */
    showForExpense?: boolean;

    /** An optional alternate message to display on expenses instead of what is provided in the "message" field */
    expenseMessage?: Message[];

    /** The next person in the approval chain of the report */
    nextReceiver?: string;

    /** An array of buttons to be displayed next to the next step */
    buttons?: Record<string, Button>;
};

export default ReportNextStep;

export type {Message};
