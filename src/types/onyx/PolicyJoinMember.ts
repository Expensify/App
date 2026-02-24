import type * as OnyxCommon from './OnyxCommon';

/** Model of policy join member */
type PolicyJoinMember = {
    /** The ID of the policy */
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
