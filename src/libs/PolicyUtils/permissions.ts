/**
 * Role checks, feature-permission bundles, and who can edit workspace settings.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {isArchivedPolicy, isControlPolicy, isSubmitPolicy} from './policyType';

type PolicyFeature = ValueOf<typeof CONST.POLICY.POLICY_FEATURE>;
type PolicyFeatureAccess = ValueOf<typeof CONST.POLICY.POLICY_FEATURE_ACCESS>;

/**
 * Checks if the current user is an admin of the policy.
 *
 * By default this answers "is the *viewing* user an admin?", because `getPolicyRole` short-circuits on the global
 * `policy.role`. When `login` belongs to somebody other than the current user you must pass
 * `shouldCheckGlobalPolicyRole = false`, otherwise the `login` argument is silently ignored.
 */
const isPolicyAdmin = (policy: OnyxInputOrEntry<Policy>, login?: string, shouldCheckGlobalPolicyRole = true): boolean =>
    getPolicyRole(policy, login, shouldCheckGlobalPolicyRole) === CONST.POLICY.ROLE.ADMIN;

/**
 * Checks if the current user is an auditor of the policy.
 *
 * When `login` belongs to somebody other than the current user, pass `shouldCheckGlobalPolicyRole = false` (see `isPolicyAdmin`).
 */
const isPolicyAuditor = (policy: OnyxInputOrEntry<Policy>, login?: string, shouldCheckGlobalPolicyRole = true): boolean =>
    getPolicyRole(policy, login, shouldCheckGlobalPolicyRole) === CONST.POLICY.ROLE.AUDITOR;

/**
 * Checks if the given account is the owner (creator) of the policy.
 *
 * The account is whoever you pass in, not necessarily the current user — callers resolving another member's role rely
 * on that.
 */
const isPolicyOwner = (policy: OnyxInputOrEntry<Pick<Policy, 'ownerAccountID'>>, accountID: number | undefined): boolean => !!accountID && policy?.ownerAccountID === accountID;

/**
 * Whether a room member's own policy role protects them from being removed from a policy expense chat.
 *
 * Only a member who was invited to the chat can be removed from it. Everybody else is there by virtue of the
 * workspace configuration, so their membership is governed by that configuration and not by this screen — see the
 * expense chat rules in `contributingGuides/philosophies/SECURITY.md`. That covers admins, the policy owner,
 * approvers, who are auto-added to the chats of everybody who submits to them, and auditors, who are default members
 * of every workspace chat.
 *
 * Fails closed on a missing `login`: without one we cannot resolve the member's role, and offering removal for a
 * member whose role is unknown could remove a workspace admin. Both the member list and the member details page must
 * agree on this, so it lives here rather than being spelled out at each call site.
 *
 * The policy owner is checked by `accountID` rather than by role. `ownerAccountID` is a required top-level field, so
 * unlike `employeeList` it resolves even when the employee roster has not loaded, and the owner is only protected
 * incidentally by `role: admin` otherwise. Note the callers' `report.ownerAccountID` is the *report* owner — the
 * employee whose expense chat it is — which is a different person from the policy owner.
 *
 * The approver check is policy-wide rather than walking this submitter's own approval chain, so an approver for a
 * different submitter who was invited into this chat is protected too. That errs toward un-removable, which is the
 * safe direction here.
 *
 * `accountID` is deliberately a required position rather than optional: omitting it silently drops the owner
 * protection, so every caller must state it even when it is `undefined`.
 */
const isRoomMemberProtectedByPolicyRole = (policy: OnyxInputOrEntry<Policy>, login: string | undefined, accountID: number | undefined): boolean =>
    isPolicyOwner(policy, accountID) || !login || isPolicyAdmin(policy, login, false) || isPolicyAuditor(policy, login, false) || isPolicyApprover(policy, login);

const ALL_POLICY_FEATURES = Object.values(CONST.POLICY.POLICY_FEATURE);

function buildFeatureAccessMap(access: PolicyFeatureAccess, excludedFeature?: PolicyFeature): Partial<Record<PolicyFeature, PolicyFeatureAccess>> {
    const features: Partial<Record<PolicyFeature, PolicyFeatureAccess>> = {};
    for (const feature of ALL_POLICY_FEATURES) {
        if (feature === excludedFeature) {
            continue;
        }
        features[feature] = access;
    }
    return features;
}

const WRITE_ALL_POLICY_FEATURES = buildFeatureAccessMap(CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE);

const READ_ALL_POLICY_FEATURES = buildFeatureAccessMap(CONST.POLICY.POLICY_FEATURE_ACCESS.READ);

const EDITOR_POLICY_FEATURES = buildFeatureAccessMap(CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE, CONST.POLICY.POLICY_FEATURE.ASSIGN_ELEVATED_ROLES);

const ROLE_PERMISSION_BUNDLES: Record<string, Partial<Record<PolicyFeature, PolicyFeatureAccess>>> = {
    [CONST.POLICY.ROLE.ADMIN]: WRITE_ALL_POLICY_FEATURES,
    [CONST.POLICY.ROLE.EDITOR]: EDITOR_POLICY_FEATURES,
    [CONST.POLICY.ROLE.AUDITOR]: {
        ...READ_ALL_POLICY_FEATURES,
        [CONST.POLICY.POLICY_FEATURE.ROOMS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
    },
    [CONST.POLICY.ROLE.USER]: {
        [CONST.POLICY.POLICY_FEATURE.OVERVIEW]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.MEMBERS]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.ROOMS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
    },
    [CONST.POLICY.ROLE.GUEST]: {
        [CONST.POLICY.POLICY_FEATURE.OVERVIEW]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
    },
    [CONST.POLICY.ROLE.CARD_ADMIN]: {
        [CONST.POLICY.POLICY_FEATURE.OVERVIEW]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.MEMBERS]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
        [CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
        [CONST.POLICY.POLICY_FEATURE.ROOMS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
    },
    [CONST.POLICY.ROLE.PEOPLE_ADMIN]: {
        [CONST.POLICY.POLICY_FEATURE.OVERVIEW]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.MEMBERS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
        [CONST.POLICY.POLICY_FEATURE.WORKFLOWS]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
        [CONST.POLICY.POLICY_FEATURE.ROOMS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
    },
    [CONST.POLICY.ROLE.PAYMENTS_ADMIN]: {
        [CONST.POLICY.POLICY_FEATURE.OVERVIEW]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.MEMBERS]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.WORKFLOWS]: CONST.POLICY.POLICY_FEATURE_ACCESS.READ,
        [CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
        [CONST.POLICY.POLICY_FEATURE.ROOMS]: CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE,
    },
};

const CONTROL_POLICY_ONLY_ROLES = [CONST.POLICY.ROLE.AUDITOR, CONST.POLICY.ROLE.GUEST, CONST.POLICY.ROLE.CARD_ADMIN, CONST.POLICY.ROLE.PEOPLE_ADMIN, CONST.POLICY.ROLE.PAYMENTS_ADMIN];

function isControlPolicyOnlyRole(role: string | undefined): boolean {
    return CONTROL_POLICY_ONLY_ROLES.some((controlPolicyOnlyRole) => controlPolicyOnlyRole === role);
}

function hasPolicyFeaturePermission(policy: OnyxInputOrEntry<Policy>, login: string, feature: PolicyFeature, requiredAccess: PolicyFeatureAccess): boolean {
    const role = (login ? policy?.employeeList?.[login]?.role : undefined) ?? getPolicyRole(policy, login);
    if (isControlPolicyOnlyRole(role) && (!policy || !isControlPolicy(policy))) {
        return false;
    }

    const access = role ? ROLE_PERMISSION_BUNDLES[role]?.[feature] : undefined;

    if (requiredAccess === CONST.POLICY.POLICY_FEATURE_ACCESS.READ) {
        return access === CONST.POLICY.POLICY_FEATURE_ACCESS.READ || access === CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE;
    }

    return access === CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE;
}

function canMemberRead(policy: OnyxInputOrEntry<Policy>, login: string, feature: PolicyFeature): boolean {
    return hasPolicyFeaturePermission(policy, login, feature, CONST.POLICY.POLICY_FEATURE_ACCESS.READ);
}

function canMemberWrite(policy: OnyxInputOrEntry<Policy>, login: string, feature: PolicyFeature): boolean {
    if (isArchivedPolicy(policy)) {
        return false;
    }
    return hasPolicyFeaturePermission(policy, login, feature, CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE);
}

function canMemberAssignRole(policy: OnyxInputOrEntry<Policy>, login: string, role: string | undefined): boolean {
    if (!role) {
        return false;
    }

    // Guest role assignment is temporarily disabled until the remaining guest issues are fixed.
    if (role === CONST.POLICY.ROLE.GUEST) {
        return false;
    }

    const isCorporatePolicy = policy?.type === CONST.POLICY.TYPE.CORPORATE;
    if (isControlPolicyOnlyRole(role) && !isCorporatePolicy) {
        return false;
    }

    if (canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.ASSIGN_ELEVATED_ROLES)) {
        return true;
    }

    // Reaching here: USER always, plus GUEST/AUDITOR only on corporate policies (control-only roles are
    // already filtered out on non-corporate policies above). Assigning USER/GUEST/AUDITOR needs the
    // MEMBERS permission, and only on corporate policies.
    const isNonElevatedRole = role === CONST.POLICY.ROLE.USER || role === CONST.POLICY.ROLE.GUEST || role === CONST.POLICY.ROLE.AUDITOR;
    return isCorporatePolicy && canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.MEMBERS) && isNonElevatedRole;
}

// Whether the member can assign any elevated role: admins (via assignElevatedRoles) on any policy, or People Admins (up to auditor) on Control.
function canMemberAssignElevatedRole(policy: OnyxInputOrEntry<Policy>, login: string): boolean {
    return canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.ASSIGN_ELEVATED_ROLES) || canMemberAssignRole(policy, login, CONST.POLICY.ROLE.AUDITOR);
}

function canMemberManageMemberWithRole(policy: OnyxInputOrEntry<Policy>, login: string, role: string | undefined): boolean {
    if (canMemberAssignRole(policy, login, role)) {
        return true;
    }

    return isSubmitPolicy(policy) && canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.MEMBERS) && role === CONST.POLICY.ROLE.EDITOR;
}

function getPolicyRole(policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string, shouldCheckGlobalPolicyRole = true): string | undefined {
    if (shouldCheckGlobalPolicyRole && policy?.role) {
        return policy.role;
    }

    if (!currentUserLogin) {
        return;
    }

    // `employeeList` is keyed by the canonical lowercase login, but a login read off personal details is not
    // guaranteed to be lowercase, so fall back to a normalized lookup when the exact key misses. Both lookups are
    // O(1), unlike a case-insensitive scan of every employee, which would run per participant on member lists.
    // Pick the employee entry first and read `role` off whichever matched: `role` is optional, so falling back on the
    // role itself would resolve one account's role from a different account's entry when the exact entry has no role.
    const employeeList = policy?.employeeList;
    return (employeeList?.[currentUserLogin] ?? employeeList?.[currentUserLogin.toLowerCase()])?.role;
}

/**
 * Whether the given role is allowed to pay (reimburse) on a workspace.
 */
function canRolePay(role: string | undefined): boolean {
    return !!role && ROLE_PERMISSION_BUNDLES[role]?.[CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS] === CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE;
}

/**
 * The roles that are allowed to pay (reimburse) on a workspace, derived from the WORKFLOWS_PAYMENTS permission. The
 * Authorized Payer (reimburser) must always hold one of these, so any role change for a payer is restricted to this set.
 */
const PAYER_ROLES = Object.values(CONST.POLICY.ROLE).filter(canRolePay);

/** Check if the passed employee is an approver in the policy's employeeList */
function isPolicyApprover(policy: OnyxInputOrEntry<Policy>, employeeLogin: string) {
    if (policy?.approver === employeeLogin) {
        return true;
    }
    return Object.values(policy?.employeeList ?? {}).some(
        (employee) => employee?.submitsTo === employeeLogin || employee?.forwardsTo === employeeLogin || employee?.overLimitForwardsTo === employeeLogin,
    );
}

/** Set of every approver login in the policy. Prefer over calling isPolicyApprover in a loop (scans employeeList once, not per candidate). */
function getPolicyApproverLogins(policy: OnyxEntry<Policy>): Set<string> {
    const approverLogins = new Set<string>();
    if (policy?.approver) {
        approverLogins.add(policy.approver);
    }
    for (const employee of Object.values(policy?.employeeList ?? {})) {
        if (employee?.submitsTo) {
            approverLogins.add(employee.submitsTo);
        }
        if (employee?.forwardsTo) {
            approverLogins.add(employee.forwardsTo);
        }
        if (employee?.overLimitForwardsTo) {
            approverLogins.add(employee.overLimitForwardsTo);
        }
    }
    return approverLogins;
}

/**
 * Checks if the current user is of the role "user" on the policy.
 */
const isPolicyUser = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean => getPolicyRole(policy, currentUserLogin) === CONST.POLICY.ROLE.USER;

/**
 * Checks if the current user is a guest of the policy.
 */
const isPolicyGuest = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean => getPolicyRole(policy, currentUserLogin) === CONST.POLICY.ROLE.GUEST;

/**
 * Checks if the current user is a workspace or card admin of the policy and the policy has a card product enabled.
 */
const isAdminOfCardEnabledPolicy = (policy: OnyxInputOrEntry<Policy>, login?: string): boolean =>
    (isPolicyAdmin(policy, login) || getPolicyRole(policy, login) === CONST.POLICY.ROLE.CARD_ADMIN) && (!!policy?.areCompanyCardsEnabled || !!policy?.areExpensifyCardsEnabled);

const isPolicyEmployee = (policyID: string | undefined, policy: OnyxEntry<Policy>): boolean => {
    return !!policyID && policyID === policy?.id;
};

const isPolicyEditor = (policy: OnyxInputOrEntry<Policy>, login?: string): boolean => getPolicyRole(policy, login) === CONST.POLICY.ROLE.EDITOR;

/**
 * Returns true if the current user can edit workspace settings — admins on any workspace,
 * or editors on Submit workspaces (Submit has no admin role, so editors manage it).
 *
 * `login` enables the per-employee role fallback in `getPolicyRole`, so partially-loaded/summary
 * policies (where `policy.role` isn't populated yet) don't incorrectly route admins/editors away.
 *
 * Archived policies are not editable regardless of role, unless `canBeAccessedIfArchived` is true.
 */
function canEditWorkspaceSettings(policy: OnyxInputOrEntry<Policy>, login?: string, canBeAccessedIfArchived = false): boolean {
    if (!canBeAccessedIfArchived && isArchivedPolicy(policy)) {
        return false;
    }
    return isPolicyAdmin(policy, login) || (isSubmitPolicy(policy) && isPolicyEditor(policy, login));
}

export {
    isPolicyAdmin,
    isPolicyOwner,
    isRoomMemberProtectedByPolicyRole,
    isControlPolicyOnlyRole,
    canMemberRead,
    canMemberWrite,
    canMemberAssignRole,
    canMemberAssignElevatedRole,
    canMemberManageMemberWithRole,
    getPolicyRole,
    canRolePay,
    PAYER_ROLES,
    isPolicyApprover,
    getPolicyApproverLogins,
    isPolicyUser,
    isPolicyGuest,
    isPolicyAuditor,
    isAdminOfCardEnabledPolicy,
    isPolicyEmployee,
    canEditWorkspaceSettings,
};

export type {PolicyFeature, PolicyFeatureAccess};
