import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Dimensions,
    Animated,
    Easing,
    Keyboard,
    Platform
} from 'react-native';
import {
    SafeAreaInsetsContext,
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import {Route} from '../../libs/Router';
import styles, {getSafeAreaPadding} from '../../styles/styles';
import variables from '../../styles/variables';
import HeaderView from './HeaderView';
import Sidebar from './sidebar/SidebarView';
import Main from './MainView';
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
import CustomStatusBar from '../../components/CustomStatusBar';
import CONST from '../../CONST';
import {fetchCountryCodeByRequestIP} from '../../libs/actions/GeoLocation';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import * as ChatSwitcher from '../../libs/actions/ChatSwitcher';

const windowSize = Dimensions.get('window');

const propTypes = {
    isSidebarShown: PropTypes.bool,
    isChatSwitcherActive: PropTypes.bool,
};
const defaultProps = {
    isSidebarShown: true,
    isChatSwitcherActive: false,
};

class App extends React.Component {
    constructor(props) {
        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        Timing.start(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);

        super(props);

        this.state = {
            windowWidth: windowSize.width,
            isNavigationMenuEnabled:
                windowSize.width <= variables.mobileResponsiveWidthBreakpoint,
            isFloatingActionButtonActive: false,
        };

        this.toggleFab = this.toggleFab.bind(this);
        this.toggleNavigationMenu = this.toggleNavigationMenu.bind(this);
        this.dismissNavigationMenu = this.dismissNavigationMenu.bind(this);
        this.showNavigationMenu = this.showNavigationMenu.bind(this);
        this.toggleNavigationMenuBasedOnDimensions = this.toggleNavigationMenuBasedOnDimensions.bind(
            this,
        );
        this.recordTimerAndToggleNavigationMenu = this.recordTimerAndToggleNavigationMenu.bind(
            this,
        );

        this.animationTranslateX = new Animated.Value(
            !props.isSidebarShown ?  Platform.isPad ? -300 :  -this.state.windowWidth : 0,
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
        PersonalDetails.fetch();
        PersonalDetails.fetchTimezone();
        fetchAllReports(true, false, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();
        Dimensions.addEventListener('change', this.toggleNavigationMenuBasedOnDimensions);

        // Set up the navigationMenu correctly once on init
        this.toggleNavigationMenuBasedOnDimensions({
            window: Dimensions.get('window'),
        });

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            ChatSwitcher.show();
        }, ['meta'], true);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isChatSwitcherActive && this.props.isChatSwitcherActive) {
            this.showNavigationMenu();
        }

        if (this.props.isSidebarShown === prevProps.isSidebarShown) {
            // Nothing changed, don't trigger animation or re-render
            return;
        }
        this.animateNavigationMenu(prevProps.isSidebarShown);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.toggleNavigationMenuBasedOnDimensions);
        KeyboardShortcut.unsubscribe('K');
    }

    /**
     * Method called when a pinned chat is selected.
     */
    recordTimerAndToggleNavigationMenu() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        this.toggleNavigationMenu();
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     */
    toggleFab() {
        this.setState(state => ({
            isFloatingActionButtonActive: !state.isFloatingActionButtonActive,
        }));
    }

    /**
     * Fired when the windows dimensions changes
     * @param {Object} changedWindow
     */
    toggleNavigationMenuBasedOnDimensions({window: changedWindow}) {
        if (this.state.windowWidth === changedWindow.width) {
            // Window width hasn't changed, don't toggle sidebar
            return;
        }

        this.setState({
            windowWidth: changedWindow.width,
            isNavigationMenuEnabled:
                changedWindow.width <= variables.mobileResponsiveWidthBreakpoint,
        });

        if (!this.props.isSidebarShown && changedWindow.width > variables.mobileResponsiveWidthBreakpoint
        ) {
            showSidebar();
        } else if (this.props.isSidebarShown && changedWindow.width < variables.mobileResponsiveWidthBreakpoint
        ) {
            hideSidebar();
        }
    }

    /**
     * Method called when we want to dismiss the navigationMenu,
     * will not do anything if it already closed
     * Only changes navigationMenu state on small screens (e.g. Mobile and mWeb)
     */
    dismissNavigationMenu() {
        if (!this.state.isNavigationMenuEnabled || !this.props.isSidebarShown) {
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
        const animationFinalValue = navigationMenuIsShown ?  Platform.isPad ? -300 :  -this.state.windowWidth : 0;

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
        if (!this.state.isNavigationMenuEnabled) {
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
        const navigationMenuStyle = this.state.isNavigationMenuEnabled && this.props.isSidebarShown
            ? styles.navigationMenuOpenAbsolute
            : styles.navigationMenuOpen;

        // Note: The visibility state for the Animated.View below is set by modifying the width of the View.
        // This is due to a known issue affecting Android where a TextInput's padding is not respected when a containing
        // parent has the display: 'none' style. See: https://github.com/facebook/react-native/issues/16405
        const visibility = !this.state.isNavigationMenuEnabled || this.props.isSidebarShown
            ? styles.sidebarVisible
            : styles.sidebarHidden;
        const appContentWrapperStyle = !this.state.isNavigationMenuEnabled
            ? styles.appContentWrapperLarge
            : null;

        return (
            <SafeAreaProvider>
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
                    {insets => (
                        <View
                            style={[styles.appContentWrapper,
                                appContentWrapperStyle,
                                styles.flexRow,
                                styles.flex1,
                                getSafeAreaPadding(insets),
                            ]}
                        >
                            <Route path={[ROUTES.REPORT, ROUTES.HOME]}>
                                <Animated.View
                                    style={[
                                        navigationMenuStyle,
                                        visibility,
                                        {
                                            transform: [{translateX: this.animationTranslateX}],
                                        },
                                    ]}
                                >
                                    <Sidebar
                                        insets={insets}
                                        onLinkClick={this.recordTimerAndToggleNavigationMenu}
                                        isChatSwitcherActive={this.props.isChatSwitcherActive}
                                        isFloatingActionButtonActive={this.state.isFloatingActionButtonActive}
                                        onFloatingActionButtonPress={this.toggleFab}

                                    />
                                </Animated.View>

                                <View
                                    style={[styles.appContent, styles.flex1, styles.flexColumn]}
                                >
                                    <HeaderView
                                        shouldShowNavigationMenuButton={
                                            this.state.isNavigationMenuEnabled
                                        }
                                        onNavigationMenuButtonClicked={this.toggleNavigationMenu}
                                    />
                                    <Main />
                                </View>
                            </Route>
                        </View>
                    )}
                </SafeAreaInsetsContext.Consumer>
            </SafeAreaProvider>
        );
    }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default withOnyx({
    isSidebarShown: {
        key: ONYXKEYS.IS_SIDEBAR_SHOWN,
    },
    isChatSwitcherActive: {
        key: ONYXKEYS.IS_CHAT_SWITCHER_ACTIVE,
        initWithStoredValues: false,
    },
})(App);
