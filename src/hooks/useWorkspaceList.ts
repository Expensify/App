import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {WorkspaceListItemType as WorkspaceListItem} from '@components/SelectionList/ListItem/types';
import type {SectionListDataType} from '@components/SelectionListWithSections/types';
import {isPolicyAdmin, shouldShowPolicy, sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';

type UseWorkspaceListParams = {
    policies: OnyxCollection<Policy>;
    currentUserLogin: string | undefined;
    shouldShowPendingDeletePolicy: boolean;
    selectedPolicyIDs: string[] | undefined;
    searchTerm: string;
    localeCompare: LocaleContextProps['localeCompare'];
    additionalFilter?: (policy: OnyxEntry<Policy>) => boolean;
    /** If false, keep ordering stable when selection changes; use initialSelectedPolicyIDs for one-time ordering */
    prioritizeSelectedOnToggle?: boolean;
    /** Initial selections to surface on first render when prioritizeSelectedOnToggle is false */
    initialSelectedPolicyIDs?: string[];
};

function useWorkspaceList({
    policies,
    currentUserLogin,
    selectedPolicyIDs,
    searchTerm,
    shouldShowPendingDeletePolicy,
    localeCompare,
    additionalFilter,
    prioritizeSelectedOnToggle = true,
    initialSelectedPolicyIDs,
}: UseWorkspaceListParams) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);
    const prioritySelection = prioritizeSelectedOnToggle ? selectedPolicyIDs : initialSelectedPolicyIDs ?? selectedPolicyIDs;
    const usersWorkspaces = useMemo(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter(
                (policy) =>
                    !!policy &&
                    shouldShowPolicy(policy, shouldShowPendingDeletePolicy, currentUserLogin) &&
                    !policy?.isJoinRequestPending &&
                    (additionalFilter ? additionalFilter(policy) : true),
            )
            .map((policy) => ({
                text: policy?.name ?? '',
                policyID: policy?.id,
                icons: [
                    {
                        source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: icons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                keyForList: `${policy?.id}`,
                isPolicyAdmin: isPolicyAdmin(policy),
                isSelected: policy?.id && selectedPolicyIDs ? selectedPolicyIDs.includes(policy.id) : false,
            }));
    }, [policies, shouldShowPendingDeletePolicy, currentUserLogin, additionalFilter, icons.FallbackWorkspaceAvatar, selectedPolicyIDs]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () =>
            tokenizedSearch(usersWorkspaces, searchTerm, (policy) => [policy.text]).sort((policy1, policy2) =>
                sortWorkspacesBySelected({policyID: policy1.policyID, name: policy1.text}, {policyID: policy2.policyID, name: policy2.text}, prioritySelection, localeCompare),
            ),
        [searchTerm, usersWorkspaces, prioritySelection, localeCompare],
    );

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
        data: filteredAndSortedUserWorkspaces,
        sections,
        shouldShowNoResultsFoundMessage,
        shouldShowSearchInput,
    };
}

export default useWorkspaceList;
export type {WorkspaceListItem};
