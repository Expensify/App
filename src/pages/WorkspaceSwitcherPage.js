/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {MagnifyingGlass} from '@components/Icon/Expensicons';
import OptionRow from '@components/OptionRow';
import OptionsSelector from '@components/OptionsSelector';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {getWorkspacesBrickRoads, getWorkspacesUnreadStatuses} from '@libs/WorkspacesUtils';
import * as App from '@userActions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import WorkspaceCardCreateAWorkspace from './workspace/card/WorkspaceCardCreateAWorkspace';

const sortWorkspacesBySelected = (workspace1, workspace2, selectedWorkspaceID) => {
    if (workspace1.policyID === selectedWorkspaceID) {
        return -1;
    }
    if (workspace2.policyID === selectedWorkspaceID) {
        return 1;
    }
    return workspace1.text.toLowerCase().localeCompare(workspace2.text.toLowerCase());
};

const propTypes = {
    /** The list of this user's policies */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the policy */
            id: PropTypes.string,

            /** The name of the policy */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,

            /** The user's role in the policy */
            role: PropTypes.string,

            /** The current action that is waiting to happen on the policy */
            pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        }),
    ),
};

const defaultProps = {
    policies: {},
};

function WorkspaceSwitcherPage({policies}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [selectedOption, setSelectedOption] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const {inputCallbackRef} = useAutoFocusInput();
    const {translate} = useLocalize();
    const {activeWorkspaceID, setActiveWorkspaceID} = useActiveWorkspace();

    const brickRoadsForPolicies = useMemo(() => getWorkspacesBrickRoads(), []);
    const unreadStatusesForPolicies = useMemo(() => getWorkspacesUnreadStatuses(), []);

    const getIndicatorTypeForPolicy = useCallback(
        (policyId) => {
            if (policyId && policyId !== activeWorkspaceID) {
                return brickRoadsForPolicies[policyId];
            }

            if (_.values(brickRoadsForPolicies).includes(CONST.BRICK_ROAD.RBR)) {
                return CONST.BRICK_ROAD.RBR;
            }

            if (_.values(brickRoadsForPolicies).includes(CONST.BRICK_ROAD.GBR)) {
                return CONST.BRICK_ROAD.GBR;
            }

            return undefined;
        },
        [activeWorkspaceID, brickRoadsForPolicies],
    );

    const hasUnreadData = useCallback(
        // TO DO: Implement checking if policy has some unread data
        // eslint-disable-next-line no-unused-vars
        (policyId) => {
            if (policyId) {
                return unreadStatusesForPolicies[policyId];
            }

            return _.some(_.values(unreadStatusesForPolicies), (status) => status);
        },
        [unreadStatusesForPolicies],
    );

    const selectPolicy = useCallback((option) => {
        const policyID = option.policyID;

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
    }, []);

    const onChangeText = useCallback((newSearchTerm) => {
        setSearchTerm(newSearchTerm);
    }, []);

    const usersWorkspaces = useMemo(
        () =>
            _.chain(policies)
                .filter((policy) => PolicyUtils.shouldShowPolicy(policy, isOffline))
                .map((policy) => ({
                    text: policy.name,
                    policyID: policy.id,
                    brickRoadIndicator: getIndicatorTypeForPolicy(policy.id),
                    icons: [
                        {
                            source: policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                            fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                            name: policy.name,
                            type: CONST.ICON_TYPE_WORKSPACE,
                        },
                    ],
                    boldStyle: hasUnreadData(policy.id),
                    keyForList: policy.id,
                }))
                .value(),
        [policies, getIndicatorTypeForPolicy, hasUnreadData],
    );

    const filteredAndSortedUserWorkspaces = useMemo(
        () =>
            _.filter(usersWorkspaces, (policy) => policy.text.toLowerCase().includes(searchTerm.toLowerCase())).sort((policy1, policy2) =>
                sortWorkspacesBySelected(policy1, policy2, activeWorkspaceID),
            ),
        [searchTerm, usersWorkspaces],
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
            text: CONST.WORKSPACE_SWITCHER.NAME,
            icons: [
                {
                    source: Expensicons.ExpensifyAppIcon,
                    name: CONST.WORKSPACE_SWITCHER.NAME,
                    type: CONST.ICON_TYPE_AVATAR,
                    displayInDefaultIconColor: true,
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
                        option={{...option, brickRoadIndicator: !activeWorkspaceID ? undefined : option.brickRoadIndicator}}
                        onSelectRow={selectPolicy}
                        showTitleTooltip={false}
                        shouldShowSubscript={false}
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
                <View style={[styles.mh4, styles.mt2, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd, ...(usersWorkspaces.length > 0 ? [styles.mb1] : [styles.mb3])]}>
                    <View>
                        <Text
                            style={[styles.mt3, styles.label]}
                            color={theme.textSupporting}
                        >
                            {translate('common.workspaces')}
                        </Text>
                    </View>
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        onPress={() => {
                            App.createWorkspaceWithPolicyDraftAndNavigateToIt();
                        }}
                    >
                        {({hovered}) => (
                            <Icon
                                src={Expensicons.Plus}
                                width={12}
                                height={12}
                                additionalStyles={[styles.buttonDefaultBG, styles.borderRadiusNormal, styles.p2, hovered && styles.buttonHoveredBG]}
                            />
                        )}
                    </PressableWithFeedback>
                </View>

                {usersWorkspaces.length > 0 ? (
                    <OptionsSelector
                        placeholderText={translate('workspace.switcher.placeholder')}
                        ref={inputCallbackRef}
                        sections={[usersWorkspacesSectionData]}
                        value={searchTerm}
                        shouldShowTextInput={usersWorkspaces.length >= CONST.WORKSPACE_SWITCHER.MINIMUM_WORKSPACES_TO_SHOW_SEARCH}
                        onChangeText={onChangeText}
                        selectedOptions={selectedOption ? [selectedOption] : []}
                        onSelectRow={selectPolicy}
                        shouldPreventDefaultFocusOnSelectRow
                        headerMessage={headerMessage}
                        highlightSelectedOptions
                        shouldShowOptions
                        autoFocus={false}
                        disableFocusOptions={!activeWorkspaceID}
                        canSelectMultipleOptions={false}
                        shouldShowSubscript={false}
                        showTitleTooltip={false}
                        contentContainerStyles={[styles.pt0, styles.mt0]}
                        textIconLeft={MagnifyingGlass}
                    />
                ) : (
                    <WorkspaceCardCreateAWorkspace />
                )}
            </>
        ),
        [inputCallbackRef, onChangeText, searchTerm, selectPolicy, selectedOption, styles, theme.textSupporting, translate, usersWorkspaces.length, usersWorkspacesSectionData],
    );

    useEffect(() => {
        if (!activeWorkspaceID) {
            return;
        }
        const optionToSet = _.find(usersWorkspaces, (option) => option.policyID === activeWorkspaceID);
        setSelectedOption(optionToSet);
    }, [activeWorkspaceID, usersWorkspaces]);

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('workspace.switcher.headerTitle')}
                backgroundColor={theme.PAGE_THEMES[SCREENS.WORKSPACE_SWITCHER.ROOT].backgroundColor}
                onBackButtonPress={Navigation.goBack}
            />
            {everythingSection}
            {workspacesSection}
        </ScreenWrapper>
    );
}

WorkspaceSwitcherPage.propTypes = propTypes;
WorkspaceSwitcherPage.defaultProps = defaultProps;
WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default withOnyx({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(WorkspaceSwitcherPage);
