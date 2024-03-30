import type * as OnyxCommon from './OnyxCommon';

type PolicyMember = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Role of the user in the policy */
    role?: string;

    /** Email of the user */
    email?: string;

    /** Email of the user this user forwards all approved reports to */
    forwardsTo?: string;

    /** Email of the user this user submits all reports to */
    submitsTo?: string;

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors?: OnyxCommon.Errors;
}>;

type PolicyMembers = Record<string, PolicyMember>;

export default PolicyMember;
export type {PolicyMembers};
