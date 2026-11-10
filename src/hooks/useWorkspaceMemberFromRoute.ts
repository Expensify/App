/** Resolves member routes across optimistic accountID and secondary-login changes. */
import {getEmployeeListLogin, getMemberLoginByAccountID} from '@libs/WorkArrangementUtils';

import type {PersonalDetails, PersonalDetailsList, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';

import usePersonalDetailByLogin from './usePersonalDetailByLogin';

type ResolvedMemberIdentity = {
    policyID: string;
    routeAccountID: number;
    login: string;
    accountID: number;
};

type WorkspaceMemberFromRoute = {
    /** The member's login, empty when the member can't be resolved */
    memberLogin: string;

    /** The member's personal details, looked up by login so they survive the optimistic accountID swap */
    memberPersonalDetails: PersonalDetails | undefined;

    /** The member's current accountID, which differs from the route's once the invite request finishes */
    accountID: number;
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
    const retainedLogin = retainedIdentity ? (personalDetails?.[retainedIdentity.accountID]?.login ?? retainedIdentity.login) : '';
    const retainedEmployeeLogin = retainedLogin ? getEmployeeListLogin(policy, retainedLogin) : '';
    const retainedMemberLogin = policy?.employeeList?.[retainedEmployeeLogin]?.role ? retainedEmployeeLogin : '';
    const personalDetailsLogin = personalDetails?.[routeAccountID]?.login;
    const employeeListLogin = personalDetailsLogin ? getEmployeeListLogin(policy, personalDetailsLogin) : '';
    // Keep the personal details login when no listed employee matches, so the member's personal details still resolve
    const memberLogin = employeeListLogin || getMemberLoginByAccountID(policy, routeAccountID) || retainedMemberLogin || (personalDetailsLogin ?? '');
    const memberPersonalDetails = usePersonalDetailByLogin(memberLogin);
    const accountID = memberPersonalDetails?.accountID ?? (memberLogin === retainedMemberLogin ? retainedIdentity?.accountID : undefined) ?? routeAccountID;

    if (policy?.id && policy.employeeList?.[memberLogin]?.role && memberPersonalDetails?.accountID && !memberPersonalDetails.isOptimisticPersonalDetail) {
        if (!retainedIdentity || retainedIdentity.login !== memberLogin || retainedIdentity.accountID !== memberPersonalDetails.accountID) {
            setResolvedIdentity({policyID: policy.id, routeAccountID, login: memberLogin, accountID: memberPersonalDetails.accountID});
        }
    } else if (resolvedIdentity && !retainedIdentity) {
        setResolvedIdentity(undefined);
    }

    return {memberLogin, memberPersonalDetails, accountID};
}

export default useWorkspaceMemberFromRoute;
