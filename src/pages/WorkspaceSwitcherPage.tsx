import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {MagnifyingGlass} from '@components/Icon/Expensicons';
import OptionRow from '@components/OptionRow';
import OptionsSelector from '@components/OptionsSelector';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
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

function WorkspaceSwitcherPage({policies}: WorkspaceSwitcherPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [selectedOption, setSelectedOption] = useState<SimpleWorkspaceItem>();
    const [searchTerm, setSearchTerm] = useState('');
    const {inputCallbackRef} = useAutoFocusInput();
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

            if (policyID) {
                setSelectedOption(option);
            } else {
                setSelectedOption(undefined);
            }
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
            }));
    }, [policies, getIndicatorTypeForPolicy, hasUnreadData, isOffline]);

    const filteredAndSortedUserWorkspaces = useMemo(
        () =>
            usersWorkspaces
                .filter((policy) => policy.text?.toLowerCase().includes(searchTerm?.toLowerCase() ?? ''))
                .sort((policy1, policy2) => sortWorkspacesBySelected(policy1, policy2, activeWorkspaceID)),
        [searchTerm, usersWorkspaces, activeWorkspaceID],
    );

    const usersWorkspacesSectionData = useMemo(
        () => ({
            data: filteredAndSortedUserWorkspaces,
            shouldShow: true,
            indexOffset: 0,
        }),
        [filteredAndSortedUserWorkspaces],
    );

    const everythingSection = useMemo(() => {
        const option = {
            reportID: '',
            text: CONST.WORKSPACE_SWITCHER.NAME,
            icons: [
                {
                    source: Expensicons.ExpensifyAppIcon,
                    name: CONST.WORKSPACE_SWITCHER.NAME,
                    type: CONST.ICON_TYPE_AVATAR,
                },
            ],
            brickRoadIndicator: getIndicatorTypeForPolicy(undefined),
            boldStyle: hasUnreadData(undefined),
        };

        return (
            <>
                <View style={[styles.mh4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb3]}>
                    <Text
                        style={styles.label}
                        color={theme.textSupporting}
                    >
                        {translate('workspace.switcher.everythingSection')}
                    </Text>
                </View>
                <View>
                    <OptionRow
                        option={option}
                        onSelectRow={selectPolicy}
                        showTitleTooltip={false}
                        highlightSelected
                        isSelected={!activeWorkspaceID}
                        optionIsFocused={!activeWorkspaceID}
                    />
                </View>
            </>
        );
    }, [activeWorkspaceID, getIndicatorTypeForPolicy, hasUnreadData, selectPolicy, styles, theme.textSupporting, translate]);

    const headerMessage = filteredAndSortedUserWorkspaces.length === 0 ? translate('common.noResultsFound') : '';

    const workspacesSection = useMemo(
        () => (
            <>
                <View style={[styles.mh4, styles.mt6, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, ...(usersWorkspaces.length > 0 ? [styles.mb1] : [styles.mb3])]}>
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

                {usersWorkspaces.length > 0 ? (
                    <OptionsSelector
                        // @ts-expect-error TODO: remove this comment once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TS
                        placeholder={translate('workspace.switcher.placeholder')}
                        ref={inputCallbackRef}
                        sections={[usersWorkspacesSectionData]}
                        value={searchTerm}
                        shouldShowTextInput={usersWorkspaces.length >= CONST.WORKSPACE_SWITCHER.MINIMUM_WORKSPACES_TO_SHOW_SEARCH}
                        onChangeText={setSearchTerm}
                        selectedOptions={selectedOption ? [selectedOption] : []}
                        onSelectRow={selectPolicy}
                        shouldPreventDefaultFocusOnSelectRow
                        headerMessage={headerMessage}
                        highlightSelectedOptions
                        shouldShowOptions
                        autoFocus={false}
                        canSelectMultipleOptions={false}
                        shouldShowSubscript={false}
                        showTitleTooltip={false}
                        contentContainerStyles={[styles.pt0, styles.mt0]}
                        textIconLeft={MagnifyingGlass}
                        // Null is to avoid selecting unfocused option when Global selected, undefined is to focus selected workspace
                        initiallyFocusedOptionKey={!activeWorkspaceID ? null : undefined}
                    />
                ) : (
                    <WorkspaceCardCreateAWorkspace />
                )}
            </>
        ),
        [
            inputCallbackRef,
            setSearchTerm,
            searchTerm,
            selectPolicy,
            selectedOption,
            styles,
            theme.textSupporting,
            translate,
            usersWorkspaces.length,
            usersWorkspacesSectionData,
            activeWorkspaceID,
            theme.icon,
            headerMessage,
        ],
    );

    useEffect(() => {
        if (!activeWorkspaceID) {
            return;
        }
        const optionToSet = usersWorkspaces.find((option) => option.policyID === activeWorkspaceID);
        setSelectedOption(optionToSet);
    }, [activeWorkspaceID, usersWorkspaces]);

    return (
        <ScreenWrapper testID={WorkspaceSwitcherPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.switcher.headerTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            {everythingSection}
            {workspacesSection}
        </ScreenWrapper>
    );
}

WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default withOnyx<WorkspaceSwitcherPageProps, WorkspaceSwitcherPageOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(WorkspaceSwitcherPage);
