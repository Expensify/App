import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import {generateAccountID} from './UserUtils';

/**
 * Whether a member commutes to an office. When neither the member nor workspace has an explicit arrangement,
 * the server treats the member as office-based by default.
 */
function getEffectiveWorkArrangement(memberArrangement: boolean | undefined, workspaceArrangement: boolean | undefined, fallbackArrangement = true): boolean {
    return memberArrangement ?? workspaceArrangement ?? fallbackArrangement;
}

function getWorkArrangementLabel(translate: LocalizedTranslate, isOfficeBased: boolean): string {
    return translate(isOfficeBased ? 'workspace.people.officeBased' : 'workspace.people.noRegularWorkspace');
}

/**
 * Resolve the login a member is listed under in the workspace employee list, or an empty string when they aren't listed.
 * A member invited with a secondary login is listed under their primary login once the invite syncs, and the secondary
 * entry can be left behind empty, so only an entry with an email or role counts as the member.
 */
function getEmployeeListLogin(policy: OnyxEntry<Policy>, login: string): string {
    const primaryLogin = policy?.primaryLoginsInvited?.[login];
    return (
        [primaryLogin, login].find((candidateLogin) => {
            const employee = candidateLogin ? policy?.employeeList?.[candidateLogin] : undefined;
            return !!employee?.email || !!employee?.role;
        }) ?? ''
    );
}

/**
 * Resolve a workspace member login from a route accountID, including IDs generated optimistically
 * while an invite is pending. Once the invite syncs, the route can keep that temporary ID even
 * though the employee entry remains available by login in the policy.
 */
function getMemberLoginByAccountID(policy: OnyxEntry<Policy>, accountID: number): string {
    const matchesAccountID = (login: string) => generateAccountID(login) === accountID || generateAccountID(Str.removeSMSDomain(login)) === accountID;
    const invitedLogin = Object.keys(policy?.primaryLoginsInvited ?? {}).find(matchesAccountID) ?? Object.keys(policy?.employeeList ?? {}).find(matchesAccountID);
    return invitedLogin ? getEmployeeListLogin(policy, invitedLogin) : '';
}

export {getEffectiveWorkArrangement, getEmployeeListLogin, getMemberLoginByAccountID, getWorkArrangementLabel};
