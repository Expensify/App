/** Model of Joinable Policy */
type JoinablePolicy = {
    /** Policy id of the workspace */
    policyID: string;
    /** Owner of the workspace */
    policyOwner: string;
    /** Name of the workspace */
    policyName: string;
    /** Count of members in the policy */
    employeeCount: number;
    /** If the user has already requested access, and is currently awaiting decision */
    hasPendingAccess: boolean;
    /** Weather the user needs an approval to join the workspace or not */
    automaticJoiningEnabled: boolean;
};

/** Model of Joinable Policies */
type JoinablePolicies = Record<string, JoinablePolicy>;

export default JoinablePolicies;

export type {JoinablePolicy};
