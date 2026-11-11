/** Resolves member routes across optimistic accountID and secondary-login changes. */
import {getEmployeeListLogin, getMemberLoginByAccountID} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';

import usePersonalDetailByLogin from './usePersonalDetailByLogin';

type ResolvedMemberIdentity = {
    policyID: string;
    routeAccountID: number;
    login: string;
    accountID: number;
    isOptimistic: boolean;
    /** The invited login is retained until a real member resolves, even if optimistic cleanup arrives first. */
    pendingInviteLogin?: string;
};

type WorkspaceMemberFromRoute = {
    /** Best-known login; while isResolvingMember is true it must not be used for mutations. */
    memberLogin: string;

    /** The member's personal details, looked up by login so they survive the optimistic accountID swap */
    memberPersonalDetails: PersonalDetails | undefined;

    /** The member's current accountID, which differs from the route's once the invite request finishes */
    accountID: number;

    /** A previously observed invitation is waiting for its authoritative member identity; never permits stale-member writes. */
    isResolvingMember: boolean;
};

/**
 * Resolves the workspace member a member page was opened for. The route may hold the optimistic accountID of a member
 * who was just invited, which stops matching personal details once the backend supplies the real one, so the member
 * is resolved by login instead. A member invited with a secondary login also switches to their primary login, so the
 * personal details login is only trusted once it maps to a listed employee.
 */
function useWorkspaceMemberFromRoute(policy: OnyxEntry<Policy>, personalDetails: OnyxEntry<PersonalDetailsList>, routeAccountID: number): WorkspaceMemberFromRoute {
    const [resolvedIdentity, setResolvedIdentity] = useState<ResolvedMemberIdentity>();
    const retainedIdentity = resolvedIdentity?.policyID === policy?.id && resolvedIdentity?.routeAccountID === routeAccountID ? resolvedIdentity : undefined;
    // The invitation message's secondary-to-primary mapping can be dismissed after this route has resolved.
    // Retain only identity, never the employee or its permissions, and revalidate against the live employee list.
    const retainedLogin = retainedIdentity ? ((!retainedIdentity.isOptimistic ? personalDetails?.[retainedIdentity.accountID]?.login : undefined) ?? retainedIdentity.login) : '';
    const retainedEmployeeLogin = retainedLogin ? getEmployeeListLogin(policy, retainedLogin) : '';
    const retainedMemberLogin = policy?.employeeList?.[retainedEmployeeLogin]?.role ? retainedEmployeeLogin : '';
    const personalDetailsLogin = personalDetails?.[routeAccountID]?.login;
    const employeeListLogin = personalDetailsLogin ? getEmployeeListLogin(policy, personalDetailsLogin) : '';
    // Keep the personal details login when no listed employee matches, so the member's personal details still resolve
    const memberLogin = employeeListLogin || getMemberLoginByAccountID(policy, routeAccountID) || retainedMemberLogin || (personalDetailsLogin ?? retainedIdentity?.pendingInviteLogin ?? '');
    const memberPersonalDetails = usePersonalDetailByLogin(memberLogin);
    const accountID = memberPersonalDetails?.accountID ?? (memberLogin === retainedMemberLogin ? retainedIdentity?.accountID : undefined) ?? routeAccountID;
    const member = policy?.employeeList?.[memberLogin];
    const hasLiveMember = !!member?.role;
    const pagePersonalDetail = memberPersonalDetails?.accountID ? personalDetails?.[memberPersonalDetails.accountID] : undefined;
    const hasRealPersonalDetails =
        !!memberPersonalDetails?.accountID &&
        !memberPersonalDetails.isOptimisticPersonalDetail &&
        pagePersonalDetail?.login === memberLogin &&
        !pagePersonalDetail?.isOptimisticPersonalDetail;
    const isPendingAdd = member?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const pendingInviteLogin =
        retainedIdentity?.pendingInviteLogin ?? (hasLiveMember && (isPendingAdd || (!retainedIdentity && memberPersonalDetails?.isOptimisticPersonalDetail)) ? memberLogin : undefined);
    const isDeleted =
        member?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
        (!!pendingInviteLogin && policy?.employeeList?.[pendingInviteLogin]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const hasInviteError = Object.keys(member?.errors ?? {}).length > 0;
    const hasSettledMember = hasLiveMember && hasRealPersonalDetails && !isPendingAdd;
    const unresolvedInviteLogin = isDeleted || hasInviteError || hasSettledMember ? undefined : pendingInviteLogin;
    const hasEditableOptimisticMember =
        isPendingAdd &&
        memberLogin === unresolvedInviteLogin &&
        !!memberPersonalDetails?.isOptimisticPersonalDetail &&
        pagePersonalDetail?.login === memberLogin &&
        !!pagePersonalDetail?.isOptimisticPersonalDetail;
    // Optimistic cleanup is not evidence of deletion. Wait for an explicit association instead of guessing a newly added employee.
    const isResolvingMember = !!unresolvedInviteLogin && (!hasLiveMember || (!hasRealPersonalDetails && !hasEditableOptimisticMember));

    if (policy?.id && hasLiveMember && !isDeleted && (hasRealPersonalDetails || unresolvedInviteLogin)) {
        if (
            !retainedIdentity ||
            retainedIdentity.login !== memberLogin ||
            retainedIdentity.accountID !== accountID ||
            retainedIdentity.isOptimistic !== !hasRealPersonalDetails ||
            retainedIdentity.pendingInviteLogin !== unresolvedInviteLogin
        ) {
            setResolvedIdentity({policyID: policy.id, routeAccountID, login: memberLogin, accountID, isOptimistic: !hasRealPersonalDetails, pendingInviteLogin: unresolvedInviteLogin});
        }
    } else if (retainedIdentity?.pendingInviteLogin && !unresolvedInviteLogin) {
        setResolvedIdentity({...retainedIdentity, pendingInviteLogin: undefined});
    } else if (resolvedIdentity && !retainedIdentity) {
        setResolvedIdentity(undefined);
    }

    return {memberLogin, memberPersonalDetails, accountID, isResolvingMember};
}

export default useWorkspaceMemberFromRoute;
