import type {Errors} from './OnyxCommon';

/** Model of Get accessible policies */
type ValidateUserAndGetAccessiblePolicies = {
    loading: boolean;

    /** Errors while fetching the policies */
    errors: Errors;
};

export default ValidateUserAndGetAccessiblePolicies;
