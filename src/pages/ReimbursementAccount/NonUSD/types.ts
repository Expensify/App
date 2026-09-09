type NonUSDPageProps = {
    /** Handles submit button press */
    onSubmit: () => void;

    onBackButtonPress: () => void;
    policyID?: string;

    /** Currency of Business Bank Account */
    currency?: string;

    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    currentSubPage?: string;
    isComingFromExpensifyCard?: boolean;

    /** Optional route name to navigate back to after flow completion - will be removed after https://github.com/Expensify/App/issues/73825 is done */
    backTo?: string;
};

export default NonUSDPageProps;
