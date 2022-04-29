import lodashGet from 'lodash/get';
import _ from 'underscore';
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
import * as WelcomeActions from '../../../libs/actions/WelcomeActions';

const propTypes = {
    /* Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /* Is workspace is being created by the user? */
    isCreatingWorkspace: PropTypes.bool,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};
const defaultProps = {
    isCreatingWorkspace: false,
};

class SidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.hideCreateMenu = this.hideCreateMenu.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);
        this.showCreateMenu = this.showCreateMenu.bind(this);

        this.state = {
            isCreateMenuActive: false,
        };
    }

    componentDidMount() {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);

        const routes = lodashGet(this.props.navigation.getState(), 'routes', []);
        WelcomeActions.show({
            routes,
            showCreateMenu: this.showCreateMenu,
        });
    }

    /**
     * Method called when we click the floating action button
     */
    showCreateMenu() {
        this.setState({
            isCreateMenuActive: true,
        });
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    hideCreateMenu() {
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
                                onAvatarClick={this.navigateToSettings}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                            />
                            <FAB
                                accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                                accessibilityRole="button"
                                isActive={this.state.isCreateMenuActive}
                                onPress={this.showCreateMenu}
                            />
                        </View>
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
        allReports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isCreatingWorkspace: {
            key: ONYXKEYS.IS_CREATING_WORKSPACE,
        },
    }),
)(SidebarScreen);
