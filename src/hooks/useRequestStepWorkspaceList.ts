/**
 * Shared data and selection logic for the workspace pickers of the expense flows (per diem, time). Each picker draws
 * its own list so it can decide whether a row tap moves on right away or only marks the row.
 */
import type {ListItem} from '@components/SelectionList/ListItem/types';

import Navigation from '@libs/Navigation/Navigation';
import {getPolicyByCustomUnitID, sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useOpenRecipientPicker from './useOpenRecipientPicker';
import useSearchResults from './useSearchResults';

type WorkspaceListItem = ListItem & {
    policyID: string;
};

type UseRequestStepWorkspaceListParams = {
    transaction: OnyxEntry<Transaction>;

    /** Returns the workspaces the picker offers */
    getPolicies: (allPolicies: OnyxCollection<Policy>, currentUserLogin: string | undefined) => Policy[];

    /** Runs once a workspace is chosen and the user isn't blocked from billable actions on it */
    onSelectWorkspace: (policy: OnyxEntry<Policy>) => void;

    /** Row the user marked but hasn't confirmed yet. Without one, the workspace the draft already points at is selected. */
    markedPolicyID?: string;
};

function useRequestStepWorkspaceList({transaction, getPolicies, onSelectWorkspace, markedPolicyID}: UseRequestStepWorkspaceListParams) {
    const {localeCompare} = useLocalize();
    const {login: currentUserLogin, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    useOpenRecipientPicker();
    const selectedWorkspace = transaction?.participants?.[0];
    const customUnitPolicy = getPolicyByCustomUnitID(transaction, allPolicies);
    const initiallyFocusedKey = selectedWorkspace?.policyID ?? customUnitPolicy?.id;
    const selectedPolicyID = markedPolicyID ?? initiallyFocusedKey;

    const availableWorkspaces = getPolicies(allPolicies, currentUserLogin);
    const workspaceOptions: WorkspaceListItem[] = availableWorkspaces
        .sort((policy1, policy2) =>
            sortWorkspacesBySelected({policyID: policy1.id, name: policy1.name}, {policyID: policy2.id, name: policy2.name}, initiallyFocusedKey ? [initiallyFocusedKey] : [], localeCompare),
        )
        .map((policy) => ({
            text: policy.name,
            policyID: policy.id,
            keyForList: policy.id,
            isSelected: selectedPolicyID === policy.id,
        }));

    const filterWorkspace = (workspaceOption: WorkspaceListItem, searchInput: string) => {
        const results = tokenizedSearch([workspaceOption], searchInput, (option) => [option.text ?? '']);
        return results.length > 0;
    };
    const sortWorkspaces = (data: WorkspaceListItem[]) => data.sort((a, b) => localeCompare(a.text ?? '', b?.text ?? ''));
    const [inputValue, setInputValue, filteredWorkspaceOptions] = useSearchResults(workspaceOptions, filterWorkspace, sortWorkspaces);

    const selectWorkspace = async (policyID: string | undefined) => {
        if (!policyID) {
            return;
        }
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        const [userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed] = await Onyx.multiGet([
            ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
            ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
            ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
        ]);
        if (shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
            return;
        }
        onSelectWorkspace(policy);
    };

    return {initiallyFocusedKey, selectedPolicyID, workspaceOptions, filteredWorkspaceOptions, inputValue, setInputValue, selectWorkspace};
}

export default useRequestStepWorkspaceList;
