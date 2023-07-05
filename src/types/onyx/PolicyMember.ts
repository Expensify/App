type PolicyMember = {
    /** Role of the user in the policy */
    role?: string;

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors?: Record<string, string>;

    /** Is this action pending? */
    pendingAction?: string;
};

export default PolicyMember;
