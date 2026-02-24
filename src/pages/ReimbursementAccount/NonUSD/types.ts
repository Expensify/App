type NonUSDPageProps = {
    /** continues to next major step */
    onNext: () => void;

    /** moves user to previous major step */
    prevPage?: () => void;

    /** ID of current policy */
    policyID?: string;

    /** Currency of the policy */
    policyCurrency?: string;

    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    /** Whether the user is coming from the expensify card */
    isComingFromExpensifyCard?: boolean;
};

export default NonUSDPageProps;
