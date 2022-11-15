import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import SidebarLinks from '../SidebarLinks';
import PopoverMenu from '../../../../components/PopoverMenu';
import FloatingActionButton from '../../../../components/FloatingActionButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import compose from '../../../../libs/compose';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import Permissions from '../../../../libs/Permissions';
import * as Policy from '../../../../libs/actions/Policy';
import Performance from '../../../../libs/Performance';
import * as Welcome from '../../../../libs/actions/Welcome';
import {sidebarPropTypes, sidebarDefaultProps} from './sidebarPropTypes';
import withDrawerState from '../../../../components/withDrawerState';
import withNavigationFocus from '../../../../components/withNavigationFocus';
import KeyboardShortcutsModal from '../../../../components/KeyboardShortcutsModal';

const propTypes = {

    /** Callback function when the menu is shown */
    onShowCreateMenu: PropTypes.func,

    /** Callback function before the menu is hidden */
    onHideCreateMenu: PropTypes.func,

    /** reportID in the current navigation state */
    reportIDFromRoute: PropTypes.string,

    ...sidebarPropTypes,
};
const defaultProps = {
    onHideCreateMenu: () => {},
    onShowCreateMenu: () => {},
    ...sidebarDefaultProps,
};

class BaseSidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.hideCreateMenu = this.hideCreateMenu.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.showCreateMenu = this.showCreateMenu.bind(this);

        this.state = {
            isCreateMenuActive: false,
        };
    }

    componentDidMount() {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);

        const routes = lodashGet(this.props.navigation.getState(), 'routes', []);
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
     * Check if LHN became inactive from active status
     *
     * @param {Object} prevProps
     * @return {boolean}
     */
    didScreenBecomeInactive(prevProps) {
        // When the Drawer gets closed and ReportScreen is shown
        if (!this.props.isDrawerOpen && prevProps.isDrawerOpen) {
            return true;
        }

        // When any other page is opened over LHN
        if (!this.props.isFocused && prevProps.isFocused) {
            return true;
        }

        return false;
    }

    /**
     * Check if LHN is inactive
     *
     * @return {boolean}
     */
    isScreenInactive() {
        // When drawer is closed and Report page is open
        if (this.props.isSmallScreenWidth && !this.props.isDrawerOpen) {
            return true;
        }

        // When any other page is open
        if (!this.props.isFocused) {
            return true;
        }

        return false;
    }

    /**
     * Method called when we click the floating action button
     */
    showCreateMenu() {
        if (this.isScreenInactive()) {
            // Prevent showing menu when click FAB icon quickly after opening other pages
            return;
        }
        this.setState({
            isCreateMenuActive: true,
        });
        this.props.onShowCreateMenu();
    }

    /**
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
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
     * Method called when a pinned chat is selected.
     */
    startTimer() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        Performance.markStart(CONST.TIMING.SWITCH_REPORT);
    }

    render() {
        // Workspaces are policies with type === 'free'
        const workspaces = _.filter(this.props.allPolicies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE);
        return (
            <ScreenWrapper
                includePaddingBottom={false}
                style={[styles.sidebar]}
            >
                {({insets}) => (
                    <>
                        <View style={[styles.flex1]}>
                            <SidebarLinks
                                onLinkClick={this.startTimer}
                                insets={insets}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                                isDrawerOpen={this.props.isDrawerOpen}
                                isCreateMenuOpen={this.state.isCreateMenuActive}
                                reportIDFromRoute={this.props.reportIDFromRoute}
                            />
                            <FloatingActionButton
                                accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                                accessibilityRole="button"
                                isActive={this.state.isCreateMenuActive}
                                onPress={this.showCreateMenu}
                            />
                        </View>
                        <KeyboardShortcutsModal />
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
                                ...(!Policy.hasActiveFreePolicy(this.props.allPolicies) ? [
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
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

BaseSidebarScreen.propTypes = propTypes;
BaseSidebarScreen.defaultProps = defaultProps;

export default compose(
    withDrawerState,
    withNavigationFocus,
)(BaseSidebarScreen);
