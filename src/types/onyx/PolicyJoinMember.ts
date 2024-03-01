import type * as OnyxCommon from './OnyxCommon';

type PolicyJoinMember = {
    /** Role of the user in the policy */
    policyID?: string;

    /** Email of the user inviting the new member */
    inviterEmail?: string;

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors?: OnyxCommon.Errors;
};

export default PolicyJoinMember;
