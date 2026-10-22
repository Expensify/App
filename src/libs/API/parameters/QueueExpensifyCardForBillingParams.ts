import type {CardProgramKey} from '@libs/CardUtils';

type QueueExpensifyCardForBillingParams = {
    domainAccountID: number;
    feedCountry?: CardProgramKey;

    /** The amount the admin entered for a partial settlement, in cents. Omitted for a full settlement */
    amount?: number;

    /** The rounded amount the admin confirmed, in cents, so the backend can refuse the request when the transactions changed since the preview */
    roundedAmount?: number;
};

export default QueueExpensifyCardForBillingParams;
