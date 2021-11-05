import _ from 'underscore';
import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withNavigationFocus} from '@react-navigation/compat';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import Tooltip from '../../components/Tooltip';
import Icon from '../../components/Icon';
import {
    Bank,
    Gear,
    ExpensifyCard,
    Receipt,
    Users,
    Workspace,
    Bill,
    Invoice,
    Luggage,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import themedefault from '../../styles/themes/default';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import Avatar from '../../components/Avatar';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import withFullPolicy, {fullPolicyPropTypes, fullPolicyDefaultProps} from './withFullPolicy';

const propTypes = {
    /** Whether the current screen is focused. */
    isFocused: PropTypes.bool.isRequired,

    ...fullPolicyPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = fullPolicyDefaultProps;

const WorkspaceInitialPage = (props) => {
    if (_.isEmpty(props.policy)) {
        return <FullScreenLoadingIndicator />;
    }

    const menuItems = [
        {
            translationKey: 'workspace.common.settings',
            icon: Gear,
            action: () => Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceSettingsRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.card',
            icon: ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceCardRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceCardRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.reimburse',
            icon: Receipt,
            action: () => Navigation.navigate(ROUTES.getWorkspaceReimburseRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceReimburseRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.bills',
            icon: Bill,
            action: () => Navigation.navigate(ROUTES.getWorkspaceBillsRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceBillsRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.invoices',
            icon: Invoice,
            action: () => Navigation.navigate(ROUTES.getWorkspaceInvoicesRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceInvoicesRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.travel',
            icon: Luggage,
            action: () => Navigation.navigate(ROUTES.getWorkspaceTravelRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceTravelRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.members',
            icon: Users,
            action: () => Navigation.navigate(ROUTES.getWorkspaceMembersRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceMembersRoute(props.policy.id)),
        },
        {
            translationKey: 'workspace.common.bankAccount',
            icon: Bank,
            action: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(props.policy.id)),
            isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceBankAccountRoute(props.policy.id)),
        },
    ];

    const openEditor = () => Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(props.policy.id));

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('workspace.common.workspace')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            <ScrollView
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                            <Pressable
                                style={[styles.pRelative, styles.avatarLarge]}
                                onPress={openEditor}
                            >
                                {props.policy.avatarURL
                                    ? (
                                        <Avatar
                                            containerStyles={styles.avatarLarge}
                                            imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                            source={props.policy.avatarURL}
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
                            </Pressable>

                            {!_.isEmpty(props.policy.name) && (
                                <Pressable
                                    style={[
                                        styles.alignSelfCenter,
                                        styles.mt4,
                                        styles.mb6,
                                        styles.w100,
                                    ]}
                                    onPress={openEditor}
                                >
                                    <Tooltip text={props.policy.name}>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.displayName,
                                                styles.alignSelfCenter,
                                            ]}
                                        >
                                            {props.policy.name}
                                        </Text>
                                    </Tooltip>
                                </Pressable>
                            )}
                        </View>
                    </View>
                    {_.map(menuItems, (item) => {
                        const shouldFocus = props.isSmallScreenWidth ? !props.isFocused && item.isActive : item.isActive;
                        return (
                            <MenuItem
                                key={item.translationKey}
                                title={props.translate(item.translationKey)}
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
WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNavigationFocus,
    withFullPolicy,
)(WorkspaceInitialPage);
