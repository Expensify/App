import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Indicates the status of ClearOutstandingBalance's response */
type RetryBillingStatus = ValueOf<typeof CONST.SUBSCRIPTION_RETRY_BILLING_STATUS>;

export default RetryBillingStatus;
