import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Animated,
    Easing,
    Keyboard,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {Route} from '../../libs/Router';
import styles, {getNavigationMenuStyle} from '../../styles/styles';
import variables from '../../styles/variables';
import SidebarScreen from './sidebar/SidebarScreen';
import ReportScreen from './ReportScreen';
import NewGroupPage from '../NewGroupPage';
import {ChatBubble} from '../../components/Icon/Expensicons';
import NewChatPage from '../NewChatPage';
import SettingsPage from '../SettingsPage';
import SearchPage from '../SearchPage';
import {
    hide as hideSidebar,
    show as showSidebar,
    setIsAnimating as setSideBarIsAnimating,
} from '../../libs/actions/Sidebar';
import {
    subscribeToReportCommentEvents,
    fetchAll as fetchAllReports,
} from '../../libs/actions/Report';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import * as Pusher from '../../libs/Pusher/pusher';
import PusherConnectionManager from '../../libs/PusherConnectionManager';
import UnreadIndicatorUpdater from '../../libs/UnreadIndicatorUpdater';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import Timing from '../../libs/actions/Timing';
import NetworkConnection from '../../libs/NetworkConnection';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import {fetchCountryCodeByRequestIP} from '../../libs/actions/GeoLocation';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import {redirect} from '../../libs/actions/App';
import RightDockedModal from '../../components/RightDockedModal';
import IOUModal from '../iou/IOUModal';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import {getBetas} from '../../libs/actions/User';
import Account from '../../libs/actions/Account';

const propTypes = {
    isSidebarShown: PropTypes.bool,
    network: PropTypes.shape({isOffline: PropTypes.bool}),
    ...windowDimensionsPropTypes,
};
const defaultProps = {
    isSidebarShown: true,
    network: {isOffline: true},
};

class HomePage extends Component {
    constructor(props) {
        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        Timing.start(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);

        super(props);

        this.state = {
            isCreateMenuActive: false,
        };

        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.toggleNavigationMenu = this.toggleNavigationMenu.bind(this);
        this.dismissNavigationMenu = this.dismissNavigationMenu.bind(this);
        this.showNavigationMenu = this.showNavigationMenu.bind(this);
        this.recordTimerAndToggleNavigationMenu = this.recordTimerAndToggleNavigationMenu.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);

        const windowBarSize = props.isSmallScreenWidth
            ? -props.windowWidth
            : -variables.sideBarWidth;
        this.animationTranslateX = new Animated.Value(
            !props.isSidebarShown ? windowBarSize : 0,
        );
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        }).then(subscribeToReportCommentEvents);

        // Fetch some data we need on initialization
        Account.fetchPriorityMode();
        PersonalDetails.fetch();
        PersonalDetails.fetchTimezone();
        getBetas();
        fetchAllReports(true, false, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();

        // Refresh the personal details, timezone and betas every 30 minutes
        // There is no pusher event that sends updated personal details data yet
        // See https://github.com/Expensify/ReactNativeChat/issues/468
        this.interval = setInterval(() => {
            if (this.props.network.isOffline) {
                return;
            }
            PersonalDetails.fetch();
            PersonalDetails.fetchTimezone();
            getBetas();
        }, 1000 * 60 * 30);

        // Set up the navigationMenu correctly once on init
        if (!this.props.isSmallScreenWidth) {
            showSidebar();
        }

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            redirect(ROUTES.SEARCH);
        }, ['meta'], true);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state)) {
            return false;
        }

        return true;
    }

    componentDidUpdate(prevProps) {
        // Always show the sidebar if we are moving from small to large screens
        if (prevProps.isSmallScreenWidth && !this.props.isSmallScreenWidth) {
            showSidebar();
        }
        if (this.props.isSidebarShown === prevProps.isSidebarShown) {
            // Nothing changed, don't trigger animation or re-render
            return;
        }
        this.animateNavigationMenu(prevProps.isSidebarShown);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
        NetworkConnection.stopListeningForReconnect();
        clearInterval(this.interval);
        this.interval = null;
    }

    /**
     * Method called when a Create Menu item is selected.
     */
    onCreateMenuItemSelected() {
        this.toggleCreateMenu();
    }

    /**
     * Method called when a pinned chat is selected.
     */
    recordTimerAndToggleNavigationMenu() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        this.toggleNavigationMenu();
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        redirect(ROUTES.SETTINGS);
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        // Prevent from possibly toggling the create menu with the sidebar hidden
        if (!this.props.isSidebarShown) {
            return;
        }
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    /**
     * Method called when we want to dismiss the navigationMenu,
     * will not do anything if it already closed
     * Only changes navigationMenu state on small screens (e.g. Mobile and mWeb)
     */
    dismissNavigationMenu() {
        if (!this.props.isSmallScreenWidth || !this.props.isSidebarShown) {
            return;
        }

        this.animateNavigationMenu(true);
    }

    /**
     * Method called when we want to show the navigationMenu,
     * will not do anything if it already open
     * Only changes navigationMenu state on smaller screens (e.g. Mobile and mWeb)
     */
    showNavigationMenu() {
        if (this.props.isSidebarShown) {
            return;
        }

        this.toggleNavigationMenu();
    }

    /**
     * Animates the navigationMenu in and out.
     *
     * @param {Boolean} navigationMenuIsShown
     */
    animateNavigationMenu(navigationMenuIsShown) {
        const windowSideBarSize = this.props.isSmallScreenWidth
            ? -variables.sideBarWidth
            : -this.props.windowWidth;
        const animationFinalValue = navigationMenuIsShown ? windowSideBarSize : 0;

        setSideBarIsAnimating(true);
        Animated.timing(this.animationTranslateX, {
            toValue: animationFinalValue,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start(({finished}) => {
            if (finished && navigationMenuIsShown) {
                hideSidebar();
            }

            if (finished) {
                setSideBarIsAnimating(false);
            }
        });
    }

    /**
     * Method called when we want to toggle the navigationMenu opened and closed
     * Only changes navigationMenu state on small screens (e.g. Mobile and mWeb)
     */
    toggleNavigationMenu() {
        if (!this.props.isSmallScreenWidth) {
            return;
        }

        // Dismiss keyboard before toggling sidebar
        Keyboard.dismiss();

        // If the navigationMenu currently is not shown, we want to make it visible before the animation
        if (!this.props.isSidebarShown) {
            showSidebar();
            return;
        }

        // Otherwise, we want to hide it after the animation
        this.animateNavigationMenu(true);
    }

    render() {
        return (
            <View style={[styles.flexRow, styles.h100, styles.appContentWrapper]}>
                <Route path={[
                    ROUTES.REPORT,
                    ROUTES.HOME,
                    ROUTES.SETTINGS,
                    ROUTES.NEW_GROUP,
                    ROUTES.IOU_REQUEST_MONEY,
                    ROUTES.IOU_GROUP_SPLIT,
                ]}
                >
                    {/* Sidebar Screen */}
                    <Animated.View style={[
                        getNavigationMenuStyle(
                            this.props.windowWidth,
                            this.props.isSidebarShown,
                            this.props.isSmallScreenWidth,
                        ),
                        {
                            transform: [{translateX: this.animationTranslateX}],
                        }]}
                    >
                        <SidebarScreen
                            onLinkClick={this.recordTimerAndToggleNavigationMenu}
                            onAvatarClick={this.navigateToSettings}
                            isCreateMenuActive={this.state.isCreateMenuActive}
                            toggleCreateMenu={this.toggleCreateMenu}
                            onCreateMenuItemSelected={this.onCreateMenuItemSelected}
                        />
                    </Animated.View>

                    {/* Report Screen */}
                    <ReportScreen
                        isSmallScreenWidth={this.props.isSmallScreenWidth}
                        toggleNavigationMenu={this.toggleNavigationMenu}
                    />

                    {/* Modal Screens */}
                    <RightDockedModal route={ROUTES.SETTINGS}>
                        <SettingsPage />
                    </RightDockedModal>
                    <RightDockedModal route={ROUTES.NEW_GROUP}>
                        <NewGroupPage />
                    </RightDockedModal>
                    <RightDockedModal route={ROUTES.NEW_CHAT}>
                        <NewChatPage />
                    </RightDockedModal>
                    <RightDockedModal route={ROUTES.SEARCH}>
                        <SearchPage />
                    </RightDockedModal>
                    <IOUModal route={ROUTES.IOU_REQUEST_MONEY}>
                        <ChatBubble />
                    </IOUModal>
                    <IOUModal route={ROUTES.IOU_GROUP_SPLIT}>
                        <ChatBubble />
                    </IOUModal>
                </Route>
            </View>
        );
    }
}

HomePage.propTypes = propTypes;
HomePage.defaultProps = defaultProps;

export default compose(
    withOnyx(
        {
            isSidebarShown: {
                key: ONYXKEYS.IS_SIDEBAR_SHOWN,
            },
            network: {
                key: ONYXKEYS.NETWORK,
            },
        },
    ),
    withWindowDimensions,
)(HomePage);
