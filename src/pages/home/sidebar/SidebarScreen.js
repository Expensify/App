import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {withNavigation} from '@react-navigation/compat';
import styles from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import PopoverMenu from '../../../components/PopoverMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Timing from '../../../libs/actions/Timing';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Permissions from '../../../libs/Permissions';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Policy from '../../../libs/actions/Policy';
import Performance from '../../../libs/Performance';
import NameValuePair from '../../../libs/actions/NameValuePair';

const propTypes = {
    /* Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /* Flag for new users used to open the Global Create menu on first load */
    isFirstTimeNewExpensifyUser: PropTypes.bool,

    /* Is workspace is being created by the user? */
    isCreatingWorkspace: PropTypes.bool,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};
const defaultProps = {
    isFirstTimeNewExpensifyUser: false,
    isCreatingWorkspace: false,
};

class SidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);

        this.state = {
            isCreateMenuActive: false,
        };
    }

    componentDidMount() {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);

        // NOTE: This setTimeout is required due to a bug in react-navigation where modals do not display properly in a drawerContent
        // This is a short-term workaround, see this issue for updates on a long-term solution: https://github.com/Expensify/App/issues/5296
        setTimeout(() => {
            if (!this.props.isFirstTimeNewExpensifyUser) {
                return;
            }

            // If we are rendering the SidebarScreen at the same time as a workspace route that means we've already created a workspace via workspace/new and should not open the global
            // create menu right now.
            const routes = lodashGet(this.props.navigation.getState(), 'routes', []);
            const topRouteName = lodashGet(_.last(routes), 'name', '');
            const isDisplayingWorkspaceRoute = topRouteName.toLowerCase().includes('workspace');

            // It's also possible that we already have a workspace policy. In either case we will not toggle the menu but do still want to set the NVP in this case since the user does
            // not need to create a workspace.
            if (!Policy.isAdminOfFreePolicy(this.props.allPolicies) && !isDisplayingWorkspaceRoute) {
                this.toggleCreateMenu();
            }

            // Set the NVP back to false so we don't automatically open the menu again
            // Note: this may need to be moved if this NVP is used for anything else later
            NameValuePair.set(CONST.NVP.IS_FIRST_TIME_NEW_EXPENSIFY_USER, false, ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER);
        }, 1500);
    }

    /**
     * Method called when a Create Menu item is selected.
     */
    onCreateMenuItemSelected() {
        this.toggleCreateMenu();
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    /**
     * Method called when a pinned chat is selected.
     */
    startTimer() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        Performance.markStart(CONST.TIMING.SWITCH_REPORT);
    }

    render() {
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
                                onAvatarClick={this.navigateToSettings}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                            />
                            <FAB
                                accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                                accessibilityRole="button"
                                isActive={this.state.isCreateMenuActive}
                                onPress={this.toggleCreateMenu}
                            />
                        </View>
                        <PopoverMenu
                            onClose={this.toggleCreateMenu}
                            isVisible={this.state.isCreateMenuActive}
                            anchorPosition={styles.createMenuPositionSidebar}
                            onItemSelected={this.onCreateMenuItemSelected}
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
                                ...(Permissions.canUsePolicyRooms(this.props.betas) ? [
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
                                        onSelected: () => Navigation.navigate(ROUTES.getWalletStatementWithDateRoute(202112)),
                                    },
                                ] : []),
                                ...(!this.props.isCreatingWorkspace && Permissions.canUseFreePlan(this.props.betas) && !Policy.isAdminOfFreePolicy(this.props.allPolicies) ? [
                                    {
                                        icon: Expensicons.NewWorkspace,
                                        iconWidth: 46,
                                        iconHeight: 40,
                                        text: this.props.translate('workspace.new.newWorkspace'),
                                        description: this.props.translate('workspace.new.getTheExpensifyCardAndMore'),
                                        onSelected: () => Policy.createAndNavigate(),
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

SidebarScreen.propTypes = propTypes;
SidebarScreen.defaultProps = defaultProps;

export default compose(
    withNavigation,
    withLocalize,
    withWindowDimensions,
    withOnyx({
        allPolicies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isFirstTimeNewExpensifyUser: {
            key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        },
        isCreatingWorkspace: {
            key: ONYXKEYS.IS_CREATING_WORKSPACE,
        },
    }),
)(SidebarScreen);
