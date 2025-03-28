import type {Errors} from './OnyxCommon';

/** Model of Get accessible policies */
type GetAccessiblePolicies = {
    /** Whether the data is being fetched */
    loading: boolean;

    /** Errors while fetching the policies */
    errors: Errors;
};

export default GetAccessiblePolicies;
