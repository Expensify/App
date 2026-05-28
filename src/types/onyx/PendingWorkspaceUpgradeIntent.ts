/**
 * A persisted, one-shot user intent to resume an action after the user upgrades a Submit workspace.
 * Stored under `ONYXKEYS.PENDING_WORKSPACE_UPGRADE_INTENT`.
 */
import type {SearchKey} from '@libs/SearchUIUtils';
import type CONST from '@src/CONST';

/** Intent to resume report approval after upgrading a Submit workspace. */
type ApproveMoneyRequestIntent = {
    /** The type of intent */
    type: typeof CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST;
    /** The ID of the policy to upgrade */
    policyID: string;
    /** The ID of the report to approve */
    reportID: string;
    /** Whether the intent is full (i.e. not a partial approval) */
    full: boolean;
    /** The alias of the upgrade feature */
    upgradeFeatureAlias: string;
    /** The back to route */
    backTo: string;
    /** The date and time the intent was created */
    created: string;
};

/** Intent to resume search approval after upgrading a Submit workspace. */
type ApproveMoneyRequestOnSearchIntent = {
    /** The type of intent */
    type: typeof CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST_ON_SEARCH;
    /** The ID of the policy to upgrade */
    policyID: string;
    /** The ID of the report to approve */
    reportID: string;
    /** The hash of the search snapshot to approve against */
    searchHash: number;
    /** The search key for the snapshot being viewed */
    currentSearchKey?: SearchKey;
    /** The alias of the upgrade feature */
    upgradeFeatureAlias: string;
    /** The back to route */
    backTo: string;
    /** The date and time the intent was created */
    created: string;
};

/**
 * The type of pending workspace upgrade intent.
 */
type PendingWorkspaceUpgradeIntent = ApproveMoneyRequestIntent | ApproveMoneyRequestOnSearchIntent | null;

export default PendingWorkspaceUpgradeIntent;
