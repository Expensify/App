import type CategorizeTrackedExpenseParams from './CategorizeTrackedExpenseParams';

// AddTrackedExpenseToPolicy is a backend alias of CategorizeTrackedExpense, so it accepts the same parameters.
type AddTrackedExpenseToPolicyParams = CategorizeTrackedExpenseParams & {
    reimbursable?: boolean;
    distance?: number;
    shouldDeferAutoSubmit?: boolean;
};

export default AddTrackedExpenseToPolicyParams;
