import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ListItem, SectionListDataType} from '@components/SelectionListWithSections/types';
import {isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
    brickRoadIndicator?: BrickRoad;
} & ListItem;

type UseWorkspaceListParams = {
    policies: OnyxCollection<Policy>;
    currentUserLogin: string | undefined;
    shouldShowPendingDeletePolicy: boolean;
    selectedPolicyIDs: string[] | undefined;
    initialSelectedPolicyIDs: string[] | undefined;
    searchTerm: string;
    localeCompare: LocaleContextProps['localeCompare'];
    additionalFilter?: (policy: OnyxEntry<Policy>) => boolean;
};

function useWorkspaceList({
    policies,
    currentUserLogin,
    selectedPolicyIDs,
    searchTerm,
    shouldShowPendingDeletePolicy,
    initialSelectedPolicyIDs = [],
    localeCompare,
    additionalFilter,
}: UseWorkspaceListParams) {
    const orderedPolicies = useMemo(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }
        const initialSelectedPolicyIDsSet = new Set(initialSelectedPolicyIDs);
        const selectedPolicies: Policy[] = [];
        const unselectedPolicies: Policy[] = [];

        const sortedItems = Object.values(policies)
            .filter(
                (policy) =>
                    !!policy &&
                    shouldShowPolicy(policy, shouldShowPendingDeletePolicy, currentUserLogin) &&
                    !policy?.isJoinRequestPending &&
                    (additionalFilter ? additionalFilter(policy) : true),
            )
            .sort((policy1, policy2) => localeCompare(policy1?.name?.toLowerCase() ?? '', policy2?.name?.toLowerCase() ?? ''));
        for (const option of sortedItems) {
            if (!option) {
                continue;
            }

            if (initialSelectedPolicyIDsSet.has(option.id)) {
                selectedPolicies.push(option);
            } else {
                unselectedPolicies.push(option);
            }
        }
        return [...selectedPolicies, ...unselectedPolicies];
    }, [policies, shouldShowPendingDeletePolicy, currentUserLogin, additionalFilter, localeCompare, initialSelectedPolicyIDs]);

    const usersWorkspaces = useMemo(() => {
        const selectedPolicyIDsSet = selectedPolicyIDs ? new Set(selectedPolicyIDs) : undefined;

        return orderedPolicies.map((policy) => ({
            text: policy?.name ?? '',
            policyID: policy?.id,
            icons: [
                {
                    source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    name: policy?.name,
                    type: CONST.ICON_TYPE_WORKSPACE,
                    id: policy?.id,
                },
            ],
            keyForList: policy?.id,
            isPolicyAdmin: isPolicyAdmin(policy),
            isSelected: policy?.id && selectedPolicyIDsSet ? selectedPolicyIDsSet.has(policy.id) : false,
        }));
    }, [orderedPolicies, selectedPolicyIDs]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(() => tokenizedSearch(usersWorkspaces, searchTerm, (policy) => [policy.text]), [searchTerm, usersWorkspaces]);

    const sections = useMemo(() => {
        const options: Array<SectionListDataType<WorkspaceListItem>> = [
            {
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
                indexOffset: 1,
            },
        ];
        return options;
    }, [filteredAndSortedUserWorkspaces]);

    const shouldShowNoResultsFoundMessage = filteredAndSortedUserWorkspaces.length === 0 && usersWorkspaces.length;
    const shouldShowSearchInput = usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    return {
        sections,
        shouldShowNoResultsFoundMessage,
        shouldShowSearchInput,
    };
}

export default useWorkspaceList;
export type {WorkspaceListItem};
