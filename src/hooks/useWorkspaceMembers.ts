import {openWorkspaceMembersPage} from '@libs/actions/Policy/Member';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {shouldFilterExpensifyTeam, isDeletedPolicyEmployee, isExpensifyTeam, canMemberRead, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {generateAccountID} from '@libs/UserUtils';

import CONST from '@src/CONST';
import type {PersonalDetails, Policy, PolicyEmployee} from '@src/types/onyx';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffectEvent, useEffect} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNetwork from './useNetwork';
import {usePersonalDetailsByLogins} from './usePersonalDetailByLogin';
import {useAllPersonalDetails} from './usePersonalDetails';

function useWorkspaceMembers(policy: OnyxEntry<Policy>) {
    const policyID = policy?.id;
    const policyOwner = policy?.owner;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails.login;
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true);
    const shouldFilter = shouldFilterExpensifyTeam(policyOwner, currentUserLogin);
    const [personalDetails] = useAllPersonalDetails();

    const getWorkspaceMembers = () => {
        if (!policyID) {
            return;
        }
        if (!canMemberRead(policy, currentUserPersonalDetails.login ?? '', CONST.POLICY.POLICY_FEATURE.MEMBERS)) {
            return;
        }
        const clientMemberEmails = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails));
        openWorkspaceMembersPage(policyID, clientMemberEmails);
    };
    const {isOffline} = useNetwork({onReconnect: getWorkspaceMembers});
    const getWorkspaceMembersEvent = useEffectEvent(() => getWorkspaceMembers());
    useEffect(() => getWorkspaceMembersEvent(), []);

    const result: Array<{email: string; policyEmployee: PolicyEmployee; accountID: number; details: PersonalDetails}> = [];
    for (const [email, policyEmployee] of Object.entries(policy?.employeeList ?? {})) {
        // Inviting a secondary login leaves an empty employeeList entry: the backend nulls that key, then
        // successData merges {pendingAction: null} back onto it. Skip it so it doesn't render as a second
        // member. A real member whose personal details haven't loaded still has a role and stays visible.
        if (isEmptyValueObject(policyEmployee) || isDeletedPolicyEmployee(policyEmployee, isOffline)) {
            continue;
        }

        // The accountID normally comes from the personal-details join. When a member's personal details
        // haven't loaded (e.g. the backend under-returns them), that join is empty, so we fall back to a
        // generated accountID. This keeps the rendered count in sync with employeeList and matches OldDot,
        // which shows every member rather than silently dropping the ones without loaded details.
        const accountID = policyMemberEmailsToAccountIDs[email] ? Number(policyMemberEmailsToAccountIDs[email]) : generateAccountID(email);

        // Render a fallback identity (email as display name) when personal details are missing so the member
        // is still shown instead of being dropped from the list.
        const details =
            personalDetails?.[accountID] ??
            ({
                accountID,
                login: email,
                displayName: formatPhoneNumber(email),
            } as PersonalDetails);

        // If this policy is owned by Expensify then show all support (expensify.com or team.expensify.com) emails
        // We don't want to show guides as policy members unless the user is a guide. Some customers get confused when they
        // see random people added to their policy, but guides having access to the policies help set them up.
        if (shouldFilter && isExpensifyTeam(details?.login ?? details?.displayName)) {
            continue;
        }

        result.push({email, policyEmployee, accountID, details});
    }

    return result;
}

export default useWorkspaceMembers;
