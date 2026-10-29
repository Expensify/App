import type {Errors} from './OnyxCommon';

/** Model of Get accessible policies */
type ValidateUserAndGetAccessiblePolicies = {
    loading: boolean;

    /** Identifies the lookup whose loading and error state this entry represents. */
    requestID?: string;

    /** Errors while fetching the policies */
    errors: Errors;
};

export default ValidateUserAndGetAccessiblePolicies;
