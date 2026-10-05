import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import {generateAccountID} from './UserUtils';

function getEffectiveWorkArrangement(memberArrangement: boolean | undefined, workspaceArrangement: boolean | undefined, fallbackArrangement = false): boolean {
    return memberArrangement ?? workspaceArrangement ?? fallbackArrangement;
}

function getWorkArrangementLabel(translate: LocalizedTranslate, isOfficeBased: boolean): string {
    return translate(isOfficeBased ? 'workspace.people.officeBased' : 'workspace.people.noRegularWorkspace');
}

/**
 * Resolve a workspace member login from a route accountID, including IDs generated optimistically
 * while an invite is pending. Once the invite syncs, the route can keep that temporary ID even
 * though the employee entry remains available by login in the policy.
 */
function getMemberLoginByAccountID(policy: OnyxEntry<Policy>, accountID: number): string {
    const matchesAccountID = (login: string) => generateAccountID(login) === accountID || generateAccountID(Str.removeSMSDomain(login)) === accountID;
    const primaryLoginOfInvitedSecondary = Object.entries(policy?.primaryLoginsInvited ?? {}).find(([secondaryLogin]) => matchesAccountID(secondaryLogin))?.[1];
    if (primaryLoginOfInvitedSecondary) {
        return primaryLoginOfInvitedSecondary;
    }
    return Object.keys(policy?.employeeList ?? {}).find(matchesAccountID) ?? '';
}

export {getEffectiveWorkArrangement, getMemberLoginByAccountID, getWorkArrangementLabel};
