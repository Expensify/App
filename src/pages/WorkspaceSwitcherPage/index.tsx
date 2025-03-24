import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import Navigation from '@libs/Navigation/Navigation';
import {getWorkspacesBrickRoads, getWorkspacesUnreadStatuses} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import switchPolicyAfterInteractions from './switchPolicyAfterInteractions';
import WorkspaceCardCreateAWorkspace from './WorkspaceCardCreateAWorkspace';

const WorkspaceCardCreateAWorkspaceInstance = <WorkspaceCardCreateAWorkspace />;

function WorkspaceSwitcherPage() {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const brickRoadsForPolicies = useMemo(() => getWorkspacesBrickRoads(reports, policies, reportActions), [reports, policies, reportActions]);
    const unreadStatusesForPolicies = useMemo(() => getWorkspacesUnreadStatuses(reports, reportActions), [reports, reportActions]);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;

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

    const {sections, shouldShowNoResultsFoundMessage, shouldShowSearchInput, shouldShowCreateWorkspace} = useWorkspaceList({
        policies,
        shouldShowPendingDeletePolicy: !!isOffline,
        currentUserLogin,
        selectedPolicyID: activeWorkspaceID,
        searchTerm: debouncedSearchTerm,
        isWorkspaceSwitcher: true,
        hasUnreadData,
        getIndicatorTypeForPolicy,
    });

    const selectPolicy = useCallback(
        (policyID?: string) => {
            const newPolicyID = policyID === activeWorkspaceID ? undefined : policyID;

            Navigation.goBack();
            // On native platforms, we will see a blank screen if we navigate to a new HomeScreen route while navigating back at the same time.
            // Therefore we delay switching the workspace until after back navigation, using the InteractionManager.
            switchPolicyAfterInteractions(newPolicyID);
        },
        [activeWorkspaceID],
    );

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
                        shouldDisplayHelpButton={false}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <SelectionList<WorkspaceListItem>
                            ListItem={UserListItem}
                            sections={sections}
                            onSelectRow={(option) => selectPolicy(option.policyID)}
                            textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : ''}
                            listEmptyContent={WorkspaceCardCreateAWorkspaceInstance}
                            shouldShowListEmptyContent={shouldShowCreateWorkspace}
                            initiallyFocusedOptionKey={activeWorkspaceID ?? CONST.WORKSPACE_SWITCHER.NAME}
                            showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            showConfirmButton={!!activeWorkspaceID}
                            shouldUseDefaultTheme
                            confirmButtonText={translate('workspace.common.clearFilter')}
                            onConfirm={() => selectPolicy(undefined)}
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default WorkspaceSwitcherPage;
