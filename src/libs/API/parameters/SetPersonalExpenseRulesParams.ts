type SetPersonalExpenseRulesParams = {
    /** Stringified JSON of the full personal expense rules array */
    value: string;

    /** Whether the saved rule should be applied to the user's existing unsubmitted expenses */
    shouldUpdateMatchingTransactions: boolean;

    /** Stringified JSON of the created or edited rule to apply (empty when nothing should be applied) */
    ruleToApply: string;
};

export default SetPersonalExpenseRulesParams;
