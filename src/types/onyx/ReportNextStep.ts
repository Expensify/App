/** Model of report next step message */
type Message = {
    /** Message content */
    text: string;

    /** HTML tag name */
    type?: string;

    // TODO: Doesn't seem to be used in app
    action?: string;
};

// TODO: Doesn't seem to be used in app
type DataOptions = {
    canSeeACHOption?: boolean;
    isManualReimbursementEnabled?: boolean;
    maskedLockedAccountNumber?: string;
    preferredWithdrawalDeleted?: boolean;
};

// TODO: Doesn't seem to be used in app
type Button = {
    text?: string;
    tooltip?: string;
    disabled?: boolean;
    hidden?: boolean;
    data?: DataOptions;
};

/** Model for next step of a report */
type ReportNextStep = {
    /** The message parts of the next step */
    message?: Message[];

    /** The title for the next step */
    title?: string;

    // TODO: Doesn't seem to be used in app
    /** Whether the user should take some sort of action in order to unblock the report */
    requiresUserAction?: boolean;

    // TODO: Doesn't seem to be used in app
    /** The type of next step */
    type: 'alert' | 'neutral' | null;

    // TODO: Doesn't seem to be used in app
    /** If the "Undo submit" button should be visible */
    showUndoSubmit?: boolean;

    // TODO: Doesn't seem to be used in app
    /** Deprecated - If the next step should be displayed on mobile, related to OldApp */
    showForMobile?: boolean;

    // TODO: Doesn't seem to be used in app
    /** If the next step should be displayed at the expense level */
    showForExpense?: boolean;

    // TODO: Doesn't seem to be used in app
    /** An optional alternate message to display on expenses instead of what is provided in the "message" field */
    expenseMessage?: Message[];

    // TODO: Doesn't seem to be used in app
    /** The next person in the approval chain of the report */
    nextReceiver?: string;

    // TODO: Doesn't seem to be used in app
    /** An array of buttons to be displayed next to the next step */
    buttons?: Record<string, Button>;
};

export default ReportNextStep;

export type {Message};
