import {useIsFocused} from '@react-navigation/native';
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
import {sortWorkspacesBySelected} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {getWorkspacesBrickRoads, getWorkspacesUnreadStatuses} from '@libs/WorkspacesSettingsUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import switchPolicyAfterInteractions from './switchPolicyAfterInteractions';
import WorkspaceCardCreateAWorkspace from './WorkspaceCardCreateAWorkspace';

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
    brickRoadIndicator?: BrickRoad;
} & ListItem;

const WorkspaceCardCreateAWorkspaceInstance = <WorkspaceCardCreateAWorkspace />;

function WorkspaceSwitcherPage() {
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const {activeWorkspaceID, setActiveWorkspaceID} = useActiveWorkspace();
    const isFocused = useIsFocused();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});

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
        (policyID?: string) => {
            if (!isFocused) {
                return;
            }
            const newPolicyID = policyID === activeWorkspaceID ? undefined : policyID;

            setActiveWorkspaceID(newPolicyID);
            Navigation.goBack();
            if (newPolicyID !== activeWorkspaceID) {
                // On native platforms, we will see a blank screen if we navigate to a new HomeScreen route while navigating back at the same time.
                // Therefore we delay switching the workspace until after back navigation, using the InteractionManager.
                switchPolicyAfterInteractions(newPolicyID);
            }
        },
        [activeWorkspaceID, setActiveWorkspaceID, isFocused],
    );

    const usersWorkspaces = useMemo<WorkspaceListItem[]>(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy) => PolicyUtils.shouldShowPolicy(policy, !!isOffline, currentUserLogin) && !policy?.isJoinRequestPending)
            .map((policy) => ({
                text: policy?.name ?? '',
                policyID: policy?.id,
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
    }, [policies, isOffline, currentUserLogin, getIndicatorTypeForPolicy, hasUnreadData, activeWorkspaceID]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () =>
            usersWorkspaces
                .filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? ''))
                .sort((policy1, policy2) => sortWorkspacesBySelected({policyID: policy1.policyID, name: policy1.text}, {policyID: policy2.policyID, name: policy2.text}, activeWorkspaceID)),
        [debouncedSearchTerm, usersWorkspaces, activeWorkspaceID],
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

    const headerMessage = filteredAndSortedUserWorkspaces.length === 0 && usersWorkspaces.length ? translate('common.noResultsFound') : '';
    const shouldShowCreateWorkspace = usersWorkspaces.length === 0;

    return (
        <ScreenWrapper
            testID={WorkspaceSwitcherPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('workspace.switcher.headerTitle')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <SelectionList<WorkspaceListItem>
                        ListItem={UserListItem}
                        sections={sections}
                        onSelectRow={(option) => selectPolicy(option.policyID)}
                        textInputLabel={usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        listEmptyContent={WorkspaceCardCreateAWorkspaceInstance}
                        shouldShowListEmptyContent={shouldShowCreateWorkspace}
                        initiallyFocusedOptionKey={activeWorkspaceID ?? CONST.WORKSPACE_SWITCHER.NAME}
                        showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                        showConfirmButton={!!activeWorkspaceID}
                        shouldUseDefaultTheme
                        confirmButtonText={translate('workspace.common.clearFilter')}
                        onConfirm={() => selectPolicy(undefined)}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default WorkspaceSwitcherPage;
