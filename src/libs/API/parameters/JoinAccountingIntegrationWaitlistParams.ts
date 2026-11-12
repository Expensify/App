import type {AccountingIntegrationWaitlistConnectionName} from '@src/types/onyx/AccountingIntegrationWaitlist';

type JoinAccountingIntegrationWaitlistParams = {
    policyID: string;
    connectionName: AccountingIntegrationWaitlistConnectionName;
};

export default JoinAccountingIntegrationWaitlistParams;
