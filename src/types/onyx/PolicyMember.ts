import * as OnyxCommon from './OnyxCommon';

type PolicyMember = {
    /** Role of the user in the policy */
    role?: string;

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors?: OnyxCommon.Errors;

    /** Is this action pending? */
    pendingAction?: OnyxCommon.PendingAction;
};

export default PolicyMember;
