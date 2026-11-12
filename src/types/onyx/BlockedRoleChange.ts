/** Model of a refused approve-only role change, delivered to the requesting client to show in a modal */
type BlockedRoleChange = {
    /** Policy the refused role change targeted */
    policyID: string;

    /** Member whose role change was refused */
    email: string;

    /** Reason keys from the API explaining why the role was refused */
    blockedReasons: string[];
};

export default BlockedRoleChange;
