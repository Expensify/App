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

    /** Whether the user should take some sort of action in order to unblock the report */
    requiresUserAction?: boolean;

    /**
     * The type of next step
     *
     * "neutral" for normal next steps, "alert" for more urgent/actionable
     */
    type: 'alert' | 'neutral' | null;

    /** Whether the "Undo submit" button should be visible */
    showUndoSubmit?: boolean;

    /** Whether the next step should be displayed on mobile, related to OldApp */
    showForMobile?: boolean;

    /** Whether the next step should be displayed at the expense level */
    showForExpense?: boolean;

    /** An optional alternate message to display on expenses instead of what is provided in the "message" field */
    expenseMessage?: Message[];

    /** Email of the next person in the approval chain that needs to approve the report */
    nextReceiver?: string;

    /** An array listing the buttons to be displayed alongside the next step copy */
    buttons?: Record<string, Button>;
};

export default ReportNextStep;

export type {Message};
