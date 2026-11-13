import type {CardProgramKey} from '@libs/CardUtils';

type QueueExpensifyCardForBillingParams = {
    domainAccountID: number;
    feedCountry?: CardProgramKey;
};

export default QueueExpensifyCardForBillingParams;
