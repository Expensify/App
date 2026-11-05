import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** Name of an accounting integration, including ones that only offer a waitlist so far */
type AccountingIntegrationWaitlistConnectionName = ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;

/** A workspace the user signed up to connect to an accounting integration once it becomes available */
type AccountingIntegrationWaitlistEntry = OnyxValueWithOfflineFeedback<{
    /** The accounting integration the user is waiting for */
    connectionName: AccountingIntegrationWaitlistConnectionName;

    /** The workspace the user wants to connect */
    policyID: string;

    /** UTC time the user joined the waitlist, set by the server */
    created?: string;

    /** Error from a failed attempt to join the waitlist */
    errors?: Errors | null;
}>;

/** Every accounting integration waitlist the user joined, one entry per integration and workspace */
type AccountingIntegrationWaitlist = AccountingIntegrationWaitlistEntry[];

export default AccountingIntegrationWaitlist;
export type {AccountingIntegrationWaitlistConnectionName};
