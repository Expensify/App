/** Resolves member routes across optimistic accountID and secondary-login changes. */
import {getEmployeeListLogin, getMemberLoginByAccountID} from '@libs/WorkArrangementUtils';

import type {PersonalDetails, PersonalDetailsList, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import usePersonalDetailByLogin from './usePersonalDetailByLogin';

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
    const personalDetailsLogin = personalDetails?.[routeAccountID]?.login;
    const employeeListLogin = personalDetailsLogin ? getEmployeeListLogin(policy, personalDetailsLogin) : '';
    // Keep the personal details login when no listed employee matches, so the member's personal details still resolve
    const memberLogin = employeeListLogin || getMemberLoginByAccountID(policy, routeAccountID) || (personalDetailsLogin ?? '');
    const memberPersonalDetails = usePersonalDetailByLogin(memberLogin);
    const accountID = memberPersonalDetails?.accountID ?? routeAccountID;

    return {memberLogin, memberPersonalDetails, accountID};
}

export default useWorkspaceMemberFromRoute;
