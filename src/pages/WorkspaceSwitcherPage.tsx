import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {getWorkspacesBrickRoads, getWorkspacesUnreadStatuses} from '@libs/WorkspacesSettingsUtils';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspaceCardCreateAWorkspace from './workspace/card/WorkspaceCardCreateAWorkspace';

type SimpleWorkspaceItem = {
    text?: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
};

const sortWorkspacesBySelected = (workspace1: SimpleWorkspaceItem, workspace2: SimpleWorkspaceItem, selectedWorkspaceID: string | undefined): number => {
    if (workspace1.policyID === selectedWorkspaceID) {
        return -1;
    }
    if (workspace2.policyID === selectedWorkspaceID) {
        return 1;
    }
    return workspace1.text?.toLowerCase().localeCompare(workspace2.text?.toLowerCase() ?? '') ?? 0;
};

type WorkspaceSwitcherPageOnyxProps = {
    /** The list of this user's policies */
    policies: OnyxCollection<Policy>;
};

type WorkspaceSwitcherPageProps = WorkspaceSwitcherPageOnyxProps;

function WorkspacesSectionHeader() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.mh4, styles.mt6, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb1]}>
            <View>
                <Text
                    style={styles.label}
                    color={theme.textSupporting}
                >
                    {translate('common.workspaces')}
                </Text>
            </View>
            <Tooltip text={translate('workspace.new.newWorkspace')}>
                <PressableWithFeedback
                    accessible={false}
                    role={CONST.ROLE.BUTTON}
                    onPress={() => {
                        Navigation.goBack();
                        interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt());
                    }}
                >
                    {({hovered}) => (
                        <Icon
                            src={Expensicons.Plus}
                            width={12}
                            height={12}
                            additionalStyles={[styles.buttonDefaultBG, styles.borderRadiusNormal, styles.p2, hovered && styles.buttonHoveredBG]}
                            fill={theme.icon}
                        />
                    )}
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}
function WorkspaceSwitcherPage({policies}: WorkspaceSwitcherPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const {activeWorkspaceID, setActiveWorkspaceID} = useActiveWorkspace();

    const brickRoadsForPolicies = useMemo(() => getWorkspacesBrickRoads(), []);
    const unreadStatusesForPolicies = useMemo(() => getWorkspacesUnreadStatuses(), []);

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
        (option?: SimpleWorkspaceItem) => {
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

    const usersWorkspaces = useMemo(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy) => PolicyUtils.shouldShowPolicy(policy, !!isOffline))
            .map((policy) => ({
                text: policy?.name,
                policyID: policy?.id,
                brickRoadIndicator: getIndicatorTypeForPolicy(policy?.id),
                icons: [
                    {
                        source: policy?.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                    },
                ],
                boldStyle: hasUnreadData(policy?.id),
                keyForList: policy?.id,
                isPolicyAdmin: PolicyUtils.isPolicyAdmin(policy),
                isSelected: activeWorkspaceID === policy?.id,
            }));
    }, [policies, isOffline, getIndicatorTypeForPolicy, hasUnreadData, activeWorkspaceID]);

    const filteredAndSortedUserWorkspaces = useMemo(
        () =>
            usersWorkspaces
                .filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? ''))
                .sort((policy1, policy2) => sortWorkspacesBySelected(policy1, policy2, activeWorkspaceID)),
        [debouncedSearchTerm, usersWorkspaces, activeWorkspaceID],
    );

    const usersWorkspacesSectionData = useMemo(() => {
        const options = [
            {
                title: translate('workspace.switcher.everythingSection'),
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: CONST.WORKSPACE_SWITCHER.NAME,
                        policyID: '',
                        icons: [{source: Expensicons.ExpensifyAppIcon, name: CONST.WORKSPACE_SWITCHER.NAME, type: CONST.ICON_TYPE_AVATAR}],
                        brickRoadIndicator: getIndicatorTypeForPolicy(undefined),
                        boldStyle: hasUnreadData(undefined),
                        isSelected: activeWorkspaceID === undefined,
                    },
                ],
            },
        ];
        if (filteredAndSortedUserWorkspaces.length > 0) {
            options.push({
                CustomSectionHeader: WorkspacesSectionHeader,
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
                indexOffset: 1,
            });
        }
        return options;
    }, [activeWorkspaceID, filteredAndSortedUserWorkspaces, getIndicatorTypeForPolicy, hasUnreadData, translate]);

    const headerMessage = filteredAndSortedUserWorkspaces.length === 0 ? translate('common.noResultsFound') : '';
    const shouldShowCreateWorkspace = usersWorkspaces.length === 0;

    const renderRightHandSideComponent = useCallback(
        (item: (typeof filteredAndSortedUserWorkspaces)[number]) => {
            if (item.isSelected) {
                return (
                    <View style={styles.defaultCheckmarkWrapper}>
                        <Icon
                            src={Expensicons.Checkmark}
                            fill={theme.iconSuccessFill}
                        />
                    </View>
                );
            }

            if (item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return (
                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={theme.danger}
                        />
                    </View>
                );
            }
            if (item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return (
                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={theme.iconSuccessFill}
                        />
                    </View>
                );
            }
            return null;
        },
        [styles, theme],
    );

    return (
        <ScreenWrapper testID={WorkspaceSwitcherPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.switcher.headerTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                ListItem={UserListItem}
                sections={usersWorkspacesSectionData}
                onSelectRow={selectPolicy}
                textInputLabel={usersWorkspaces.length >= CONST.WORKSPACE_SWITCHER.MINIMUM_WORKSPACES_TO_SHOW_SEARCH ? translate('common.search') : undefined}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                rightHandSideComponent={renderRightHandSideComponent}
                footerContent={shouldShowCreateWorkspace && <WorkspaceCardCreateAWorkspace />}
            />
        </ScreenWrapper>
    );
}

WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default withOnyx<WorkspaceSwitcherPageProps, WorkspaceSwitcherPageOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(WorkspaceSwitcherPage);
