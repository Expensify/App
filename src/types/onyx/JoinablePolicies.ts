import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

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
    /** Whether the user needs an approval to join the workspace or not */
    automaticJoiningEnabled: boolean;
    /** Policy type returned by the backend (`team` | `corporate` | `submit2026` | ...). */
    policyType?: ValueOf<typeof CONST.POLICY.TYPE>;
};

/** Model of Joinable Policies */
type JoinablePolicies = Record<string, JoinablePolicy>;

export default JoinablePolicies;
export type {JoinablePolicy};
