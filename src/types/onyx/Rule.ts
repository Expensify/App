import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {ApprovalWorkflowRule} from './ApprovalWorkflowRules';
import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';

/** The kind of entity a rule is scoped to (currently only workspace policies). */
type RuleScope = ValueOf<typeof CONST.RULES.SCOPE>;

/**
 * A rule as stored in the `ONYXKEYS.COLLECTION.RULE` collection under `rules_<ruleID>`. This mirrors a
 * row of the server `rules` table: the AST rule body (`triggers`/`filters`/`actions`) plus the
 * `scope`/`scopeID` that associate it with an entity (a policy, for approval workflows).
 *
 * The same collection is intended to hold every kind of AST rule in the future, not just approval
 * workflows.
 */
type Rule = OnyxValueWithOfflineFeedback<
    ApprovalWorkflowRule & {
        /** What kind of entity this rule is scoped to. */
        scope: RuleScope;

        /** ID of the scoped entity (the policyID for `policy`-scoped rules). */
        scopeID: string;

        /** ISO timestamp of when the rule was created. */
        created?: string;

        /** Errors from the latest failed write of this rule. */
        errors?: Errors;
    }
>;

export default Rule;
