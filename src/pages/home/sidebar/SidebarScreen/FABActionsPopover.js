import React from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import Permissions from '../../../../libs/Permissions';
import * as Policy from '../../../../libs/actions/Policy';
import PopoverMenu from '../../../../components/PopoverMenu';
import CONST from '../../../../CONST';
import FloatingActionButton from '../../../../components/FloatingActionButton';
import compose from '../../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import ONYXKEYS from '../../../../ONYXKEYS';
import withNavigation from '../../../../components/withNavigation';
import * as Welcome from '../../../../libs/actions/Welcome';

const propTypes = {
    /* Callback function when the menu is shown */
    onShowCreateMenu: PropTypes.func,

    /* Callback function before the menu is hidden */
    onHideCreateMenu: PropTypes.func,

    /** The list of policies the user has access to. */
    allPolicies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /* Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    allPolicies: {},
    betas: [],
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
class FABActionsPopover extends React.Component {
    constructor(props) {
        super(props);

        this.showCreateMenu = this.showCreateMenu.bind(this);
        this.hideCreateMenu = this.hideCreateMenu.bind(this);

        this.state = {
            isCreateMenuActive: false,
        };
    }

    componentDidMount() {
        const routes = lodashGet(this.props.navigation.getState(), 'routes', []);
        Welcome.show({routes, showCreateMenu: this.showCreateMenu});
    }

    /**
     * Method called when we click the floating action button
     */
    showCreateMenu() {
        this.setState({
            isCreateMenuActive: true,
        });
        this.props.onShowCreateMenu();
    }

    /**
     * Method called either when:
     * - Pressing the floating action button to open the CreateMenu modal
     * - Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    hideCreateMenu() {
        this.props.onHideCreateMenu();
        this.setState({
            isCreateMenuActive: false,
        });
    }

    render() {
        // Workspaces are policies with type === 'free'
        const workspaces = _.filter(this.props.allPolicies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE);

        return (
            <>
                <PopoverMenu
                    onClose={this.hideCreateMenu}
                    isVisible={this.state.isCreateMenuActive}
                    anchorPosition={styles.createMenuPositionSidebar}
                    onItemSelected={this.hideCreateMenu}
                    fromSidebarMediumScreen={!this.props.isSmallScreenWidth}
                    menuItems={[
                        {
                            icon: Expensicons.ChatBubble,
                            text: this.props.translate('sidebarScreen.newChat'),
                            onSelected: () => Navigation.navigate(ROUTES.NEW_CHAT),
                        },
                        {
                            icon: Expensicons.Users,
                            text: this.props.translate('sidebarScreen.newGroup'),
                            onSelected: () => Navigation.navigate(ROUTES.NEW_GROUP),
                        },
                        ...(Permissions.canUsePolicyRooms(this.props.betas) && workspaces.length ? [
                            {
                                icon: Expensicons.Hashtag,
                                text: this.props.translate('sidebarScreen.newRoom'),
                                onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_NEW_ROOM),
                            },
                        ] : []),
                        ...(Permissions.canUseIOUSend(this.props.betas) ? [
                            {
                                icon: Expensicons.Send,
                                text: this.props.translate('iou.sendMoney'),
                                onSelected: () => Navigation.navigate(ROUTES.IOU_SEND),
                            },
                        ] : []),
                        ...(Permissions.canUseIOU(this.props.betas) ? [
                            {
                                icon: Expensicons.MoneyCircle,
                                text: this.props.translate('iou.requestMoney'),
                                onSelected: () => Navigation.navigate(ROUTES.IOU_REQUEST),
                            },
                        ] : []),
                        ...(Permissions.canUseIOU(this.props.betas) ? [
                            {
                                icon: Expensicons.Receipt,
                                text: this.props.translate('iou.splitBill'),
                                onSelected: () => Navigation.navigate(ROUTES.IOU_BILL),
                            },
                        ] : []),
                        ...(!Policy.isAdminOfFreePolicy(this.props.allPolicies) ? [
                            {
                                icon: Expensicons.NewWorkspace,
                                iconWidth: 46,
                                iconHeight: 40,
                                text: this.props.translate('workspace.new.newWorkspace'),
                                description: this.props.translate('workspace.new.getTheExpensifyCardAndMore'),
                                onSelected: () => Policy.createWorkspace(),
                            },
                        ] : []),
                    ]}
                />
                <FloatingActionButton
                    accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                    accessibilityRole="button"
                    isActive={this.state.isCreateMenuActive}
                    onPress={this.showCreateMenu}
                />
            </>
        );
    }
}

FABActionsPopover.propTypes = propTypes;
FABActionsPopover.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNavigation,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(FABActionsPopover);
