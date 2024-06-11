import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Model of private subscription */
type PrivateSubscription = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** "auto increase annual seats" setting */
    addNewUsersAutomatically: boolean;

    /** "auto renew" setting */
    autoRenew: boolean;

    /** The date "auto renew" was last edited */
    autoRenewLastChangedDate: string;

    /** "corporate karma" setting */
    donateToExpensifyOrg?: true;

    /** Subscription end date */
    endDate: string;

    /** Subscription start date */
    startDate: string;

    /** Subscription variant. "yearly2018" - annual, "monthly2018" - pay-per-use */
    type: ValueOf<typeof CONST.SUBSCRIPTION.TYPE>;

    /** Subscription size */
    userCount?: number;

    /** Field-specific error messages */
    errorFields?: OnyxCommon.ErrorFields;
}>;

export default PrivateSubscription;
