import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, SectionListDataType} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {getWorkspacesBrickRoads, getWorkspacesUnreadStatuses} from '@libs/WorkspacesSettingsUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import WorkspaceCardCreateAWorkspace from '@pages/workspace/card/WorkspaceCardCreateAWorkspace';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspacesSectionHeader from './WorkspacesSectionHeader';

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
    brickRoadIndicator?: BrickRoad;
} & ListItem;

const sortWorkspacesBySelected = (workspace1: WorkspaceListItem, workspace2: WorkspaceListItem, selectedWorkspaceID: string | undefined): number => {
    if (workspace1.policyID === selectedWorkspaceID) {
        return -1;
    }
    if (workspace2.policyID === selectedWorkspaceID) {
        return 1;
    }
    return workspace1.text?.toLowerCase().localeCompare(workspace2.text?.toLowerCase() ?? '') ?? 0;
};

const WorkspaceCardCreateAWorkspaceInstance = <WorkspaceCardCreateAWorkspace />;

function WorkspaceSwitcherPage() {
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const {activeWorkspaceID, setActiveWorkspaceID} = useActiveWorkspace();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const brickRoadsForPolicies = useMemo(() => getWorkspacesBrickRoads(reports, policies, reportActions), [reports, policies, reportActions]);
    const unreadStatusesForPolicies = useMemo(() => getWorkspacesUnreadStatuses(reports), [reports]);

    const getIndicatorTypeForPolicy = useCallback(
        (policyId?: string) => {
            if (policyId && policyId !== activeWorkspaceID) {
                return brickRoadsForPolicies[policyId];
            }

            if (Object.values(brickRoadsForPolicies).includes(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR)) {
                return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
            }

            if (Object.values(brickRoadsForPolicies).includes(CONST.BRICK_ROAD_INDICATOR_STATUS.INFO)) {
                return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
            }

            return undefined;
        },
        [activeWorkspaceID, brickRoadsForPolicies],
    );

    const hasUnreadData = useCallback(
        // TO DO: Implement checking if policy has some unread data
        (policyId?: string) => {
            if (policyId) {
                return unreadStatusesForPolicies[policyId];
            }

            return Object.values(unreadStatusesForPolicies).some((status) => status);
        },
        [unreadStatusesForPolicies],
    );

    const selectPolicy = useCallback(
        (option?: WorkspaceListItem) => {
            if (!option) {
                return;
            }

            const {policyID} = option;

            setActiveWorkspaceID(policyID);
            Navigation.goBack();
            if (policyID !== activeWorkspaceID) {
                Navigation.navigateWithSwitchPolicyID({policyID});
            }
        },
        [activeWorkspaceID, setActiveWorkspaceID],
    );

    const usersWorkspaces = useMemo<WorkspaceListItem[]>(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy) => PolicyUtils.shouldShowPolicy(policy, !!isOffline) && !policy?.isJoinRequestPending)
            .map((policy) => ({
                text: policy?.name ?? '',
                policyID: policy?.id ?? '',
                brickRoadIndicator: getIndicatorTypeForPolicy(policy?.id),
                icons: [
                    {
                        source: policy?.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                isBold: hasUnreadData(policy?.id),
                keyForList: policy?.id,
                isPolicyAdmin: PolicyUtils.isPolicyAdmin(policy),
                isSelected: activeWorkspaceID === policy?.id,
            }));
    }, [policies, isOffline, getIndicatorTypeForPolicy, hasUnreadData, activeWorkspaceID]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () =>
            usersWorkspaces
                .filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? ''))
                .sort((policy1, policy2) => sortWorkspacesBySelected(policy1, policy2, activeWorkspaceID)),
        [debouncedSearchTerm, usersWorkspaces, activeWorkspaceID],
    );

    const sections = useMemo(() => {
        const options: Array<SectionListDataType<WorkspaceListItem>> = [
            {
                title: translate('workspace.switcher.everythingSection'),
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: CONST.WORKSPACE_SWITCHER.NAME,
                        icons: [{source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR}],
                        brickRoadIndicator: getIndicatorTypeForPolicy(undefined),
                        isSelected: activeWorkspaceID === undefined,
                        keyForList: CONST.WORKSPACE_SWITCHER.NAME,
                    },
                ],
            },
        ];
        options.push({
            CustomSectionHeader: WorkspacesSectionHeader,
            data: filteredAndSortedUserWorkspaces,
            shouldShow: true,
            indexOffset: 1,
        });
        return options;
    }, [activeWorkspaceID, filteredAndSortedUserWorkspaces, getIndicatorTypeForPolicy, translate]);

    const headerMessage = filteredAndSortedUserWorkspaces.length === 0 && usersWorkspaces.length ? translate('common.noResultsFound') : '';
    const shouldShowCreateWorkspace = usersWorkspaces.length === 0;

    return (
        <ScreenWrapper
            testID={WorkspaceSwitcherPage.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('workspace.switcher.headerTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList<WorkspaceListItem>
                ListItem={UserListItem}
                sections={sections}
                onSelectRow={selectPolicy}
                shouldDebounceRowSelect
                textInputLabel={usersWorkspaces.length >= CONST.WORKSPACE_SWITCHER.MINIMUM_WORKSPACES_TO_SHOW_SEARCH ? translate('common.search') : undefined}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                listFooterContent={shouldShowCreateWorkspace ? WorkspaceCardCreateAWorkspaceInstance : null}
                initiallyFocusedOptionKey={activeWorkspaceID ?? CONST.WORKSPACE_SWITCHER.NAME}
                showLoadingPlaceholder
            />
        </ScreenWrapper>
    );
}

WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default WorkspaceSwitcherPage;
