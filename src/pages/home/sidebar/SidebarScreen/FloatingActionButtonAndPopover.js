import React from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import NAVIGATORS from '../../../../NAVIGATORS';
import SCREENS from '../../../../SCREENS';
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
import withNavigationFocus from '../../../../components/withNavigationFocus';
import * as Task from '../../../../libs/actions/Task';
import * as Session from '../../../../libs/actions/Session';
import * as IOU from '../../../../libs/actions/IOU';

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        role: policy.role,
    };

const propTypes = {
    ...withLocalizePropTypes,

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

    /** Indicated whether the report data is loading */
    isLoading: PropTypes.bool,
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    allPolicies: {},
    betas: [],
    isLoading: false,
};

/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
class FloatingActionButtonAndPopover extends React.Component {
    constructor(props) {
        super(props);

        this.showCreateMenu = this.showCreateMenu.bind(this);
        this.hideCreateMenu = this.hideCreateMenu.bind(this);
        this.interceptAnonymousUser = this.interceptAnonymousUser.bind(this);

        this.state = {
            isCreateMenuActive: false,
            isAnonymousUser: Session.isAnonymousUser(),
        };
    }

    componentDidMount() {
        const navigationState = this.props.navigation.getState();
        const routes = lodashGet(navigationState, 'routes', []);
        const currentRoute = routes[navigationState.index];
        if (currentRoute && ![NAVIGATORS.CENTRAL_PANE_NAVIGATOR, SCREENS.HOME].includes(currentRoute.name)) {
            return;
        }
        Welcome.show({routes, showCreateMenu: this.showCreateMenu});
    }

    componentDidUpdate(prevProps) {
        if (!this.didScreenBecomeInactive(prevProps)) {
            return;
        }

        // Hide menu manually when other pages are opened using shortcut key
        this.hideCreateMenu();
    }

    /**
     * Check if LHN status changed from active to inactive.
     * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
     *
     * @param {Object} prevProps
     * @return {Boolean}
     */
    didScreenBecomeInactive(prevProps) {
        // When any other page is opened over LHN
        if (!this.props.isFocused && prevProps.isFocused) {
            return true;
        }

        return false;
    }

    /**
     * Method called when we click the floating action button
     */
    showCreateMenu() {
        if (!this.props.isFocused && this.props.isSmallScreenWidth) {
            return;
        }
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
        if (!this.state.isCreateMenuActive) {
            return;
        }
        this.props.onHideCreateMenu();
        this.setState({
            isCreateMenuActive: false,
        });
    }

    /**
     * Checks if user is anonymous. If true, shows the sign in modal, else,
     * executes the callback.
     *
     * @param {Function} callback
     */
    interceptAnonymousUser(callback) {
        if (this.state.isAnonymousUser) {
            Session.signOutAndRedirectToSignIn();
        } else {
            callback();
        }
    }

    render() {
        // Workspaces are policies with type === 'free'
        const workspaces = _.filter(this.props.allPolicies, (policy) => policy && policy.type === CONST.POLICY.TYPE.FREE);

        return (
            <View>
                <PopoverMenu
                    onClose={this.hideCreateMenu}
                    isVisible={this.state.isCreateMenuActive}
                    anchorPosition={styles.createMenuPositionSidebar(this.props.windowHeight)}
                    onItemSelected={this.hideCreateMenu}
                    fromSidebarMediumScreen={!this.props.isSmallScreenWidth}
                    menuItems={[
                        {
                            icon: Expensicons.ChatBubble,
                            text: this.props.translate('sidebarScreen.newChat'),
                            onSelected: () => this.interceptAnonymousUser(() => Navigation.navigate(ROUTES.NEW_CHAT)),
                        },
                        {
                            icon: Expensicons.Users,
                            text: this.props.translate('sidebarScreen.newGroup'),
                            onSelected: () => this.interceptAnonymousUser(() => Navigation.navigate(ROUTES.NEW_GROUP)),
                        },
                        ...(Permissions.canUsePolicyRooms(this.props.betas) && workspaces.length
                            ? [
                                  {
                                      icon: Expensicons.Hashtag,
                                      text: this.props.translate('sidebarScreen.newRoom'),
                                      onSelected: () => this.interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_NEW_ROOM)),
                                  },
                              ]
                            : []),
                        ...(Permissions.canUseIOUSend(this.props.betas)
                            ? [
                                  {
                                      icon: Expensicons.Send,
                                      text: this.props.translate('iou.sendMoney'),
                                      onSelected: () => this.interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.MONEY_REQUEST_TYPE.SEND)),
                                  },
                              ]
                            : []),
                        ...(Permissions.canUseIOU(this.props.betas)
                            ? [
                                  {
                                      icon: Expensicons.MoneyCircle,
                                      text: this.props.translate('iou.requestMoney'),
                                      onSelected: () => this.interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)),
                                  },
                              ]
                            : []),
                        ...(Permissions.canUseIOU(this.props.betas)
                            ? [
                                  {
                                      icon: Expensicons.Receipt,
                                      text: this.props.translate('iou.splitBill'),
                                      onSelected: () => this.interceptAnonymousUser(() => IOU.startMoneyRequest(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)),
                                  },
                              ]
                            : []),
                        ...(Permissions.canUseTasks(this.props.betas)
                            ? [
                                  {
                                      icon: Expensicons.Task,
                                      text: this.props.translate('newTaskPage.assignTask'),
                                      onSelected: () => this.interceptAnonymousUser(() => Task.clearOutTaskInfoAndNavigate()),
                                  },
                              ]
                            : []),
                        ...(!this.props.isLoading && !Policy.hasActiveFreePolicy(this.props.allPolicies)
                            ? [
                                  {
                                      icon: Expensicons.NewWorkspace,
                                      iconWidth: 46,
                                      iconHeight: 40,
                                      text: this.props.translate('workspace.new.newWorkspace'),
                                      description: this.props.translate('workspace.new.getTheExpensifyCardAndMore'),
                                      onSelected: () => this.interceptAnonymousUser(() => Policy.createWorkspace()),
                                  },
                              ]
                            : []),
                    ]}
                />
                <FloatingActionButton
                    accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    isActive={this.state.isCreateMenuActive}
                    onPress={this.showCreateMenu}
                />
            </View>
        );
    }
}

FloatingActionButtonAndPopover.propTypes = propTypes;
FloatingActionButtonAndPopover.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNavigation,
    withNavigationFocus,
    withWindowDimensions,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policySelector,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isLoading: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(FloatingActionButtonAndPopover);
