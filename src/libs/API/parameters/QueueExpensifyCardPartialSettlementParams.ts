type QueueExpensifyCardPartialSettlementParams = {
    feedCountry?: string;
    domainAccountID: number;

    /** The amount the admin entered, in cents */
    amount: number;

    /** The rounded amount the admin confirmed, in cents */
    roundedAmount: number;
};

export default QueueExpensifyCardPartialSettlementParams;
