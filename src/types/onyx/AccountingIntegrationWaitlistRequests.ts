import type {AccountingIntegrationWaitlistConnectionName} from './AccountingIntegrationWaitlist';
import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** A request to join an accounting integration waitlist that is still pending or that failed */
type AccountingIntegrationWaitlistRequest = OnyxValueWithOfflineFeedback<{
    /** Error from a failed attempt to join the waitlist */
    errors?: Errors | null;
}>;

/**
 * Waitlist requests by workspace ID and then integration. They live apart from the waitlist, which only holds what the
 * server saved, so each request updates its own entry instead of rewriting the whole list.
 */
type AccountingIntegrationWaitlistRequests = Record<string, Partial<Record<AccountingIntegrationWaitlistConnectionName, AccountingIntegrationWaitlistRequest | null>>>;

export default AccountingIntegrationWaitlistRequests;
