import type {CardProgramKey} from '@libs/CardUtils';

type CalculateExpensifyCardPartialSettlementParams = {
    domainAccountID: number;
    feedCountry?: CardProgramKey;

    /** The amount the admin entered, in cents */
    amount: number;
};

export default CalculateExpensifyCardPartialSettlementParams;
