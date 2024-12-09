import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Model of report next step message */
type Message = {
    /** Message content */
    text: string;

    /** HTML tag name */
    type?: string;

    /** Action for the user to take */
    action?: string;

    /** The text to be copied when the user clicks this section */
    clickToCopyText?: string;
};

/** Model of report next step button data */
type DataOptions = {
    /** Whether the user should see the option to pay via Expensify (ACH) */
    canSeeACHOption?: boolean;

    /** Whether workspace reimbursements is set to Indirect reimbursements */
    isManualReimbursementEnabled?: boolean;

    /**
     * If there is a masked bank account number from the server, the account needs to be unlocked
     *
     * (Note: Copied directly from a comment in Old Dot JS)
     */
    maskedLockedAccountNumber?: string;

    /** Whether the preferred business bank account of the policy is deleted or no longer accessible to the policy reimburser */
    preferredWithdrawalDeleted?: boolean;
};

/** Model of report next step button */
type Button = {
    /** Text/label shown on the button */
    text?: string;

    /** Text to show on a tooltip */
    tooltip?: string;

    /** Whether the button should be disabled */
    disabled?: boolean;

    /** Whether the button should be hidden */
    hidden?: boolean;

    /** Data needed to render the button and handle its click events */
    data?: DataOptions;
};

/** Model for next step of a report */
type ReportNextStep = {
    /** The message parts of the next step */
    message?: Message[];

    /** The icon for the next step */
    icon: ValueOf<typeof CONST.NEXT_STEP.ICONS>;

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
