import type {ProhibitedExpenses} from '@src/types/onyx/Policy';

type SetPolicyProhibitedExpensesParams = {
    policyID: string;
    prohibitedExpenses: ProhibitedExpenses;
};

export default SetPolicyProhibitedExpensesParams;
