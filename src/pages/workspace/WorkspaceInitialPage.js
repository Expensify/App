import _ from 'underscore';
import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withNavigationFocus} from '@react-navigation/compat';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Tooltip from '../../components/Tooltip';
import ExpensifyText from '../../components/ExpensifyText';
import ConfirmModal from '../../components/ConfirmModal';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
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
import * as PolicyActions from '../../libs/actions/Policy';

const propTypes = {
    /** Whether the current screen is focused. */
    isFocused: PropTypes.bool.isRequired,

    ...fullPolicyPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = fullPolicyDefaultProps;

class WorkspaceInitialPage extends React.Component {
    constructor(props) {
        super(props);

        const policy = this.props.policy;
        this.openEditor = this.openEditor.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);

        this.menuItems = [
            {
                translationKey: 'workspace.common.settings',
                icon: Expensicons.Gear,
                action: () => Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceSettingsRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.card',
                icon: Expensicons.ExpensifyCard,
                action: () => Navigation.navigate(ROUTES.getWorkspaceCardRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceCardRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.reimburse',
                icon: Expensicons.Receipt,
                action: () => Navigation.navigate(ROUTES.getWorkspaceReimburseRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceReimburseRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.bills',
                icon: Expensicons.Bill,
                action: () => Navigation.navigate(ROUTES.getWorkspaceBillsRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceBillsRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.invoices',
                icon: Expensicons.Invoice,
                action: () => Navigation.navigate(ROUTES.getWorkspaceInvoicesRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceInvoicesRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.travel',
                icon: Expensicons.Luggage,
                action: () => Navigation.navigate(ROUTES.getWorkspaceTravelRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceTravelRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.members',
                icon: Expensicons.Users,
                action: () => Navigation.navigate(ROUTES.getWorkspaceMembersRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceMembersRoute(policy.id)),
            },
            {
                translationKey: 'workspace.common.bankAccount',
                icon: Expensicons.Bank,
                action: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policy.id)),
                isActive: Navigation.isActiveRoute(ROUTES.getWorkspaceBankAccountRoute(policy.id)),
            },
        ];

        this.state = {
            isDeleteModalOpen: false,
        };
    }

    /**
     * Open Workspace Editor
     */
    openEditor() { Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(this.props.policy.id)); }

    /**
     * Toggle delete confirm modal visibility
     * @param {Boolean} shouldOpen
     */
    toggleDeleteModal(shouldOpen) {
        this.setState({isDeleteModalOpen: shouldOpen});
    }

    /**
     * Call the delete policy and hide the modal
     */
    confirmDeleteAndHideModal() {
        PolicyActions.deletePolicy(this.props.policy.id);
        this.toggleDeleteModal(false);
    }


    render() {
        if (_.isEmpty(this.props.policy)) {
            return <FullScreenLoadingIndicator />;
        }

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.workspace')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Plus,
                            text: this.props.translate('workspace.new.newWorkspace'),
                            onSelected: () => PolicyActions.createAndNavigate(),
                        }, {
                            icon: Expensicons.Trashcan,
                            text: this.props.translate('workspace.common.delete'),
                            onSelected: () => this.setState({isDeleteModalOpen: true}),
                        },
                    ]}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffset}
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
                                    onPress={this.openEditor}
                                >
                                    {this.props.policy.avatarURL
                                        ? (
                                            <Avatar
                                                containerStyles={styles.avatarLarge}
                                                imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                                source={this.props.policy.avatarURL}
                                            />
                                        )
                                        : (
                                            <Icon
                                                src={Expensicons.Workspace}
                                                height={80}
                                                width={80}
                                                fill={themedefault.iconSuccessFill}
                                            />
                                        )}
                                </Pressable>
                                {!_.isEmpty(this.props.policy.name) && (
                                    <Pressable
                                        style={[
                                            styles.alignSelfCenter,
                                            styles.mt4,
                                            styles.mb6,
                                            styles.w100,
                                        ]}
                                        onPress={this.openEditor}
                                    >
                                        <Tooltip text={this.props.policy.name}>
                                            <ExpensifyText
                                                numberOfLines={1}
                                                style={[
                                                    styles.displayName,
                                                    styles.alignSelfCenter,
                                                ]}
                                            >
                                                {this.props.policy.name}
                                            </ExpensifyText>
                                        </Tooltip>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                        {_.map(this.menuItems, (item) => {
                            const shouldFocus = this.props.isSmallScreenWidth ? !this.props.isFocused && item.isActive : item.isActive;
                            return (
                                <MenuItem
                                    key={item.translationKey}
                                    title={this.props.translate(item.translationKey)}
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
                <ConfirmModal
                    title={this.props.translate('workspace.common.delete')}
                    isVisible={this.state.isDeleteModalOpen}
                    onConfirm={this.confirmDeleteAndHideModal}
                    onCancel={() => this.toggleDeleteModal(false)}
                    prompt={this.props.translate('workspace.common.deleteConfirmation')}
                    confirmText={this.props.translate('common.delete')}
                    cancelText={this.props.translate('common.cancel')}
                />
            </ScreenWrapper>
        );
    }
}

WorkspaceInitialPage.propTypes = propTypes;
WorkspaceInitialPage.defaultProps = defaultProps;
WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNavigationFocus,
    withFullPolicy,
)(WorkspaceInitialPage);
