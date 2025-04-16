import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import type {ListItem, SectionListDataType} from '@components/SelectionList/types';
import {isPolicyAdmin, shouldShowPolicy, sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
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
    selectedPolicyID: string | undefined;
    searchTerm: string;
    additionalFilter?: (policy: OnyxEntry<Policy>) => boolean;
} & (
    | {
          isWorkspaceSwitcher: true;
          hasUnreadData: (policyID?: string) => boolean;
          getIndicatorTypeForPolicy: (policyID?: string) => BrickRoad;
      }
    | {
          isWorkspaceSwitcher?: false | undefined;
          hasUnreadData?: never;
          getIndicatorTypeForPolicy?: never;
      }
);

function useWorkspaceList({
    policies,
    currentUserLogin,
    selectedPolicyID,
    searchTerm,
    shouldShowPendingDeletePolicy,
    isWorkspaceSwitcher = false,
    hasUnreadData,
    getIndicatorTypeForPolicy,
    additionalFilter,
}: UseWorkspaceListParams) {
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
                isSelected: selectedPolicyID === policy?.id,
                ...(isWorkspaceSwitcher &&
                    hasUnreadData &&
                    getIndicatorTypeForPolicy && {
                        isBold: hasUnreadData(policy?.id),
                        brickRoadIndicator: getIndicatorTypeForPolicy(policy?.id),
                    }),
            }));
    }, [policies, shouldShowPendingDeletePolicy, currentUserLogin, additionalFilter, selectedPolicyID, getIndicatorTypeForPolicy, hasUnreadData, isWorkspaceSwitcher]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () =>
            usersWorkspaces
                .filter((policy) => policy.text?.toLowerCase().includes(searchTerm?.toLowerCase() ?? ''))
                .sort((policy1, policy2) => sortWorkspacesBySelected({policyID: policy1.policyID, name: policy1.text}, {policyID: policy2.policyID, name: policy2.text}, selectedPolicyID)),
        [searchTerm, usersWorkspaces, selectedPolicyID],
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
    const shouldShowCreateWorkspace = isWorkspaceSwitcher && usersWorkspaces.length === 0;

    return {
        sections,
        shouldShowNoResultsFoundMessage,
        shouldShowSearchInput,
        shouldShowCreateWorkspace,
    };
}

export default useWorkspaceList;
export type {WorkspaceListItem};
