import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ListItem, SectionListDataType} from '@components/SelectionList/types';
import {getFirstSelectedItem} from '@libs/OptionsListUtils';
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
    searchTerm: string;
    localeCompare: LocaleContextProps['localeCompare'];
    additionalFilter?: (policy: OnyxEntry<Policy>) => boolean;
};

function useWorkspaceList({policies, currentUserLogin, selectedPolicyIDs, searchTerm, shouldShowPendingDeletePolicy, localeCompare, additionalFilter}: UseWorkspaceListParams) {
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
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                keyForList: policy?.id,
                isPolicyAdmin: isPolicyAdmin(policy),
                isSelected: policy?.id && selectedPolicyIDs ? selectedPolicyIDs.includes(policy.id) : false,
            }));
    }, [policies, shouldShowPendingDeletePolicy, currentUserLogin, additionalFilter, selectedPolicyIDs]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () => tokenizedSearch(usersWorkspaces, searchTerm, (policy) => [policy.text]).sort((policy1, policy2) => localeCompare(policy1.text, policy2.text)),
        [searchTerm, usersWorkspaces, localeCompare],
    );

    const {sections, firstKeyForList} = useMemo(() => {
        const options: Array<SectionListDataType<WorkspaceListItem>> = [
            {
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
                indexOffset: 1,
            },
        ];
        const firstKeyForList = getFirstSelectedItem(filteredAndSortedUserWorkspaces);
        return {sections: options, firstKeyForList: firstKeyForList};
    }, [filteredAndSortedUserWorkspaces]);

    const shouldShowNoResultsFoundMessage = filteredAndSortedUserWorkspaces.length === 0 && usersWorkspaces.length;
    const shouldShowSearchInput = usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    return {
        sections,
        shouldShowNoResultsFoundMessage,
        shouldShowSearchInput,
        firstKeyForList,
    };
}

export default useWorkspaceList;
export type {WorkspaceListItem};
