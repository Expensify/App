import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderPageLayout from '@components/HeaderPageLayout';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import colors from '@styles/colors';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Policy from '@userActions/Policy';
import Icon from '@src/components/Icon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import OptionsSelector from '@components/OptionsSelector';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import OptionRow from '@components/OptionRow';

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
    activeWorkspaceID: PropTypes.arrayOf([PropTypes.undefined, PropTypes.string]),
};

const defaultProps = {
    policies: {},
    activeWorkspaceID: undefined,
};

function WorkspacesSelectorPage({policies, activeWorkspaceID}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const getIndicatorTypeForPolicy = useCallback(
        // TO DO: Wait for missing logic to be implemented in other PR
        // CONST.BRICK_ROAD_INDICATOR_STATUS.INFO or CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
        (policyId) => undefined,
        [],
    );

    const getMenuItem = useCallback(
        (item) => {
            const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;


            const option = {
                text: keyTitle,
                brickRoadIndicator: getIndicatorTypeForPolicy(item.policyId),
                icons: [{
                    source: item.icon,
                    type: item.iconType,
                    fill: item.iconFill,
                    name: keyTitle,
                    fallbackIcon: item.fallbackIcon,
                }],
            }

            // return (
            //     <MenuItem
            //         title={keyTitle}
            //         icon={item.icon}
            //         iconType={CONST.ICON_TYPE_WORKSPACE}
            //         onPress={item.action}
            //         iconStyles={item.iconStyles}
            //         iconFill={item.iconFill}
            //         fallbackIcon={item.fallbackIcon}
            //         brickRoadIndicator={item.brickRoadIndicator}
            //         disabled={item.disabled}
            //         rightComponent={rightComponent}
            //         shouldShowRightComponent={shouldShowRightComponent}
            //     />
            // );

            return (
                <OptionRow
                    option={option}
                    onSelectRow={item.action}
                    showTitleTooltip={false}
                    shouldShowSubscript={false}
                    highlightSelected
                    isSelected={item.policyId === activeWorkspaceID}
                />
            );

        },
        [activeWorkspaceID, getIndicatorTypeForPolicy, translate],
    );

    const usersWorkspaces = useMemo(
        () =>
            _.chain(policies)
                .filter((policy) => PolicyUtils.shouldShowPolicy(policy, isOffline))
                .map((policy) => ({
                    title: policy.name,
                    policyId: policy.id,
                    icon: policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                    iconType: CONST.ICON_TYPE_WORKSPACE,
                    action: () => {
                        Policy.selectWorkspace(policy.id);
                    },
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    pendingAction: policy.pendingAction,
                    errors: policy.errors,
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                }))
                .sortBy((policy) => policy.title.toLowerCase())
                .value(),
        [policies, isOffline],
    );

    const usersWorkspacesSectionData = useMemo(
        () =>
           [{
                data: usersWorkspaces,
                shouldShow: true,
                indexOffset: 0,
            }],
        [usersWorkspaces],
    );

    const allWorkspaces = useMemo(
        () => [
            {
                title: 'Expensify',
                icon: Expensicons.ExpensifyAppIcon,
                iconType: CONST.ICON_TYPE_AVATAR,
                action: () => {
                    Policy.selectWorkspace(undefined);
                },
                indicatorType: getIndicatorTypeForPolicy(undefined),
            },
        ],
        [getIndicatorTypeForPolicy],
    );

    const getWorkspacesSection = useCallback(
        (workspaces, section, showAddWorkspaceButton) => {

            return (
                <View>
                   <View style={[styles.mh4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb3]}>
                <Text
                    style={styles.label}
                    color={theme.textSupporting}
                >
                    {section}
                </Text>
                {showAddWorkspaceButton && <PressableWithFeedback accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}>
                    {({hovered}) => (
                        <Icon
                            src={Expensicons.Plus}
                            width={12}
                            height={12}
                            additionalStyles={[styles.highlightBG, styles.borderRadiusNormal, styles.p2, hovered && styles.bordersBG]}
                        />
                    )}
                </PressableWithFeedback>}
            </View>
                    <View style={{marginBottom: 12}}>
                        {_.map(workspaces, (item, index) => getMenuItem(item, index))}
                    </View>
                </View>
            );
        },
        [getMenuItem, styles.alignItemsCenter, styles.borderRadiusNormal, styles.bordersBG, styles.flexRow, styles.highlightBG, styles.justifyContentBetween, styles.label, styles.mb3, styles.mh4, styles.p2, theme.textSupporting],
    );

    const allWorkspacesSection = useMemo(() => getWorkspacesSection(allWorkspaces, 'Everything', false, false), [allWorkspaces, getWorkspacesSection]);
    const usersWorkspacesSection = useMemo(() => getWorkspacesSection(usersWorkspaces, 'Workspaces', true, true), [getWorkspacesSection, usersWorkspaces]);

    // const {inputCallbackRef} = useAutoFocusInput();


    return (
        <HeaderPageLayout
            title="Choose a workspace"
            backgroundColor={theme.PAGE_THEMES[SCREENS.WORKSPACE_SELECTOR.ROOT].backgroundColor}
        >
            {allWorkspacesSection}
            {usersWorkspacesSection}
            {/* <OptionsSelector
                            ref={inputCallbackRef}
                            onAddToSelection={(option) => {}}
                            sections={usersWorkspacesSectionData}
                            selectedOptions={[]}
                            value="Find"
                            onSelectRow={(option) => {}}
                            onChangeText
                            headerMessage
                            boldStyle
                            shouldPreventDefaultFocusOnSelectRow
                            shouldShowOptions
                            autoFocus={false}
                        /> */}
        </HeaderPageLayout>
    );
}

WorkspacesSelectorPage.propTypes = propTypes;
WorkspacesSelectorPage.defaultProps = defaultProps;
WorkspacesSelectorPage.displayName = 'WorkspacesSelectorPage';

export default withOnyx({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    activeWorkspaceID: {
        key: ONYXKEYS.ACTIVE_WORKSPACE_ID,
    },
})(WorkspacesSelectorPage);
