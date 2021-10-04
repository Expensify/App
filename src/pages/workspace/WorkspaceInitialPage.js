import _ from 'underscore';
import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withNavigationFocus} from '@react-navigation/compat';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import {
    Users,
    ExpensifyCard,
    Workspace,
    Pencil,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import themedefault from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Avatar from '../../components/Avatar';
import Tooltip from '../../components/Tooltip';
import variables from '../../styles/variables';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    /** Whether the current screen is focused. */
    isFocused: PropTypes.bool.isRequired,

    /** Policy for the current route */
    policy: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,

        /** Name of the policy */
        name: PropTypes.string,
    }),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    policy: {},
};

const WorkspaceInitialPage = ({
    translate, isSmallScreenWidth, policy, isFocused,
}) => {
    if (_.isEmpty(policy)) {
        return <FullScreenLoadingIndicator />;
    }

    const menuItems = [
        {
            translationKey: 'workspace.common.settings',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceSettingsRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.card',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceCardRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceCardRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.reimburse',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceReimburseRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceReimburseRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.bills',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceBillsRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceBillsRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.invoices',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceInvoicesRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceInvoicesRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.travel',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceTravelRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceTravelRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.members',
            icon: Users,
            action: () => Navigation.navigate(ROUTES.getWorkspacePeopleRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspacePeopleRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.bankAccount',
            icon: Users,
            action: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceBankAccountRoute(policy.id)),
        },
    ];

    const openEditor = () => Navigation.navigate(ROUTES.getWorkspaceEditorRoute(policy.id));

    return (
        <ScreenWrapper>
            <ScrollView
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    {isSmallScreenWidth
                        && (
                            <HeaderWithCloseButton
                                title={translate('workspace.common.workspace')}
                                onCloseButtonPress={() => Navigation.dismissModal()}
                            />
                        )}
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                            <Pressable
                                style={[styles.pRelative, styles.avatarLarge]}
                                onPress={openEditor}
                            >
                                {policy.avatarURL
                                    ? (
                                        <Avatar
                                            containerStyles={styles.avatarLarge}
                                            imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                            source={policy.avatarURL}
                                        />
                                    )
                                    : (
                                        <Icon
                                            src={Workspace}
                                            height={80}
                                            width={80}
                                            fill={themedefault.iconSuccessFill}
                                        />
                                    )}
                                <Tooltip absolute text={translate('workspace.common.edit')}>
                                    <View style={[styles.smallEditIcon, styles.smallAvatarEditIcon]}>
                                        <Icon
                                            src={Pencil}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                            fill={themedefault.iconReversed}
                                        />
                                    </View>
                                </Tooltip>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.alignSelfCenter,
                                    styles.mt4,
                                    styles.mb6,
                                    styles.w100,
                                ]}
                                onPress={openEditor}
                            >
                                <Tooltip text={policy.name}>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.displayName,
                                            styles.alignSelfCenter,
                                        ]}
                                    >
                                        {policy.name}
                                    </Text>
                                </Tooltip>
                            </Pressable>
                        </View>
                    </View>
                    {menuItems.map((item) => {
                        const shouldFocus = isSmallScreenWidth ? !isFocused && item.isActive : item.isActive;
                        return (
                            <MenuItem
                                key={item.translationKey}
                                title={translate(item.translationKey)}
                                icon={item.icon}
                                iconRight={item.iconRight}
                                onPress={() => item.action()}
                                wrapperStyle={shouldFocus ? styles.activeComponentBG : undefined}
                                focused={shouldFocus}
                                shouldShowRightIcon
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

WorkspaceInitialPage.propTypes = propTypes;
WorkspaceInitialPage.defaultProps = defaultProps;
WorkspaceInitialPage.displayName = 'WorkspaceSidebar';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNavigationFocus,
    withOnyx({
        policy: {
            key: (props) => {
                const routes = lodashGet(props.navigation.getState(), 'routes', []);
                const routeWithPolicyIDParam = _.find(routes, route => route.params && route.params.policyID);
                const policyID = lodashGet(routeWithPolicyIDParam, ['params', 'policyID']);
                return `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
            },
        },
    }),
)(WorkspaceInitialPage);
