import type {Errors} from './OnyxCommon';

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
type KeyJoinablePolicies = {
    /** Record of joinable policies, indexed by policy id */
    policies: Record<string, JoinablePolicy>;
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** Error message */
    errors?: Errors;
};

export default KeyJoinablePolicies;

export type {JoinablePolicy};
