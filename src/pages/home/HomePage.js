import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Dimensions,
    Animated,
    Easing,
    Keyboard,
    Pressable,
} from 'react-native';
import {SafeAreaInsetsContext, SafeAreaProvider} from 'react-native-safe-area-context';
import {withOnyx} from 'react-native-onyx';
import {Route} from '../../libs/Router';
import styles, {getSafeAreaPadding} from '../../styles/styles';
import variables from '../../styles/variables';
import hamburgerInputPadding from '../../styles/hamburgerInputPadding';
import Header from './HeaderView';
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
import {fetch as fetchPersonalDetails} from '../../libs/actions/PersonalDetails';
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
            isHamburgerEnabled: windowSize.width <= variables.mobileResponsiveWidthBreakpoint,
        };

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.dismissHamburger = this.dismissHamburger.bind(this);
        this.showHamburger = this.showHamburger.bind(this);
        this.toggleHamburgerBasedOnDimensions = this.toggleHamburgerBasedOnDimensions.bind(this);
        this.recordTimerAndToggleHamburger = this.recordTimerAndToggleHamburger.bind(this);

        this.animationTranslateX = new Animated.Value(
            !props.isSidebarShown ? -300 : 0
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

        // Fetch all the personal details
        fetchPersonalDetails();

        fetchAllReports(true, false, true);

        UnreadIndicatorUpdater.listenForReportChanges();

        Dimensions.addEventListener('change', this.toggleHamburgerBasedOnDimensions);

        // Set up the hamburger correctly once on init
        this.toggleHamburgerBasedOnDimensions({window: Dimensions.get('window')});

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isChatSwitcherActive && this.props.isChatSwitcherActive) {
            this.showHamburger();
        }

        if (this.props.isSidebarShown === prevProps.isSidebarShown) {
            // Nothing changed, don't trigger animation or re-render
            return;
        }
        this.animateHamburger(prevProps.isSidebarShown);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.toggleHamburgerBasedOnDimensions);
    }

    /**
     * Method called when a pinned chat is selected.
     */
    recordTimerAndToggleHamburger() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        this.toggleHamburger();
    }

    /**
     * Fired when the windows dimensions changes
     * @param {Object} changedWindow
     */
    toggleHamburgerBasedOnDimensions({window: changedWindow}) {
        this.setState({isHamburgerEnabled: changedWindow.width <= variables.mobileResponsiveWidthBreakpoint});
        if (!this.props.isSidebarShown && changedWindow.width > variables.mobileResponsiveWidthBreakpoint) {
            showSidebar();
        } else if (this.props.isSidebarShown && changedWindow.width < variables.mobileResponsiveWidthBreakpoint) {
            hideSidebar();
        }
    }

    /**
     * Method called when we want to dismiss the hamburger menu,
     * will not do anything if it already closed
     * Only changes hamburger state on small screens (e.g. Mobile and mWeb)
     */
    dismissHamburger() {
        if (!this.state.isHamburgerEnabled || !this.props.isSidebarShown) {
            return;
        }

        this.animateHamburger(true);
    }

    /**
     * Method called when we want to show the hamburger menu,
     * will not do anything if it already open
     * Only changes hamburger state on smaller screens (e.g. Mobile and mWeb)
     */
    showHamburger() {
        if (this.props.isSidebarShown) {
            return;
        }

        this.toggleHamburger();
    }

    /**
     * Animates the Hamburger menu in and out.
     *
     * @param {Boolean} hamburgerIsShown
     */
    animateHamburger(hamburgerIsShown) {
        const animationFinalValue = hamburgerIsShown ? -300 : 0;

        setSideBarIsAnimating(true);
        Animated.timing(this.animationTranslateX, {
            toValue: animationFinalValue,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false
        }).start(({finished}) => {
            if (finished && hamburgerIsShown) {
                hideSidebar();
            }

            if (finished) {
                setSideBarIsAnimating(false);
            }
        });
    }

    /**
     * Method called when we want to toggle the hamburger menu opened and closed
     * Only changes hamburger state on small screens (e.g. Mobile and mWeb)
     */
    toggleHamburger() {
        if (!this.state.isHamburgerEnabled) {
            return;
        }

        // Dismiss keyboard before toggling sidebar
        Keyboard.dismiss();

        // If the hamburger currently is not shown, we want to make it visible before the animation
        if (!this.props.isSidebarShown) {
            showSidebar();
            return;
        }

        // Otherwise, we want to hide it after the animation
        this.animateHamburger(true);
    }

    render() {
        let hamburgerStyle = hamburgerInputPadding();
        if (!hamburgerStyle) {
            hamburgerStyle = this.state.isHamburgerEnabled && this.props.isSidebarShown ? styles.hamburgerOpenAbsolute
                : styles.hamburgerOpen;
        }
        const visibility = !this.state.isHamburgerEnabled || this.props.isSidebarShown ? styles.dFlex : styles.dNone;
        const appContentWrapperStyle = !this.state.isHamburgerEnabled ? styles.appContentWrapperLarge : null;
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
                                getSafeAreaPadding(insets)
                            ]}
                        >
                            <Route path={[ROUTES.REPORT, ROUTES.HOME]}>
                                <Animated.View style={[
                                    hamburgerStyle,
                                    visibility,
                                    {
                                        transform: [{translateX: this.animationTranslateX}]
                                    }]}
                                >
                                    <Sidebar
                                        insets={insets}
                                        onLinkClick={this.recordTimerAndToggleHamburger}
                                        isChatSwitcherActive={this.props.isChatSwitcherActive}
                                    />
                                </Animated.View>
                                {/* The following pressable allows us to click outside the LHN to close it,
                                and should be enabled only if the LHN is open. Otherwise, it will capture
                                some onPress events, causing scrolling issues. */}
                                <Pressable
                                    disabled={!this.props.isSidebarShown}
                                    style={[styles.flex1]}
                                    onPress={this.dismissHamburger}
                                >
                                    <View
                                        style={[styles.appContent, styles.flex1, styles.flexColumn]}
                                    >
                                        <Header
                                            shouldShowHamburgerButton={this.state.isHamburgerEnabled}
                                            onHamburgerButtonClicked={this.toggleHamburger}
                                        />
                                        <Main />
                                    </View>
                                </Pressable>
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

export default withOnyx(
    {
        isSidebarShown: {
            key: ONYXKEYS.IS_SIDEBAR_SHOWN
        },
        isChatSwitcherActive: {
            key: ONYXKEYS.IS_CHAT_SWITCHER_ACTIVE,
            initWithStoredValues: false,
        },
    },
)(App);
