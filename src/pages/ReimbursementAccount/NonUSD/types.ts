type NonUSDPageProps = {
    /** Handles submit button press */
    onSubmit: () => void;

    /** Handles back button press */
    onBackButtonPress: () => void;

    /** ID of current policy */
    policyID?: string;

    /** Currency of Business Bank Account */
    currency?: string;

    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    /** Name of the current sub page */
    currentSubPage?: string;

    /** Whether the user is coming from the expensify card */
    isComingFromExpensifyCard?: boolean;
};

export default NonUSDPageProps;
