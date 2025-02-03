import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Picklist */
type Picklist = Array<{
    /** Option id */
    id: string;
    /** Option name */
    name: string;
    /** Option string value  */
    stringValue: string;
}>;

/** CorpayOnboardingFields */
type CorpayOnboardingFields = {
    /** Fields for step 3 */
    company: string[];

    /** Fields for step 4 */
    beneficialOwnerFields: string[];

    /** Fields for step 5 */
    companyDirectorFields: string[];

    /**  Fields for step 5 */
    director: string[];

    /** Fields for step 4 */
    owner: string[];

    /** Picklists for step 3 */
    picklists: Record<ValueOf<typeof CONST.NON_USD_BANK_ACCOUNT.BUSINESS_INFO_STEP.PICKLIST>, Picklist>;
};

export default CorpayOnboardingFields;
