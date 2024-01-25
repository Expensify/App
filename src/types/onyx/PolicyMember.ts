import type * as OnyxCommon from './OnyxCommon';

type PolicyMember = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Role of the user in the policy */
    role?: string;

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors?: OnyxCommon.Errors;
}>;

type PolicyMembers = Record<string, PolicyMember>;

export default PolicyMember;
export type {PolicyMembers};
