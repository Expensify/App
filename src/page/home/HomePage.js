import React from 'react';
import PropTypes from 'prop-types';
import {
    StatusBar,
    View,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import {SafeAreaInsetsContext, SafeAreaProvider} from 'react-native-safe-area-context';
import {Route} from '../../lib/Router';
import styles, {getSafeAreaPadding} from '../../style/StyleSheet';
import Header from './HeaderView';
import Sidebar from './sidebar/SidebarView';
import Main from './MainView';
import {hide as hideSidebar, show as showSidebar} from '../../lib/actions/Sidebar';
import {subscribeToReportCommentEvents, fetchAll as fetchAllReports} from '../../lib/actions/Report';
import {fetch as fetchPersonalDetails} from '../../lib/actions/PersonalDetails';
import * as Pusher from '../../lib/Pusher/pusher';
import UnreadIndicatorUpdater from '../../lib/UnreadIndicatorUpdater';
import ROUTES from '../../ROUTES';
import NetworkConnection from '../../lib/NetworkConnection';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';

const windowSize = Dimensions.get('window');
const widthBreakPoint = 1000;

const propTypes = {
    isSidebarShown: PropTypes.bool,
};
const defaultProps = {
    isSidebarShown: true,
};

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isHamburgerEnabled: windowSize.width <= widthBreakPoint,
        };

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.dismissHamburger = this.dismissHamburger.bind(this);
        this.showHamburger = this.showHamburger.bind(this);
        this.toggleHamburgerBasedOnDimensions = this.toggleHamburgerBasedOnDimensions.bind(this);
        this.animationTranslateX = new Animated.Value(!props.isSidebarShown ? -300 : 0);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        Pusher.init().then(subscribeToReportCommentEvents);

        // Fetch all the personal details
        fetchPersonalDetails();

        // Fetch all the reports
        fetchAllReports();

        UnreadIndicatorUpdater.listenForReportChanges();

        Dimensions.addEventListener('change', this.toggleHamburgerBasedOnDimensions);

        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(true);
    }

    componentDidUpdate(prevProps) {
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
     * Fired when the windows dimensions changes
     * @param {object} changedWindow
     */
    toggleHamburgerBasedOnDimensions({window: changedWindow}) {
        this.setState({isHamburgerEnabled: changedWindow.width <= widthBreakPoint});
        if (!this.props.isSidebarShown && changedWindow.width > widthBreakPoint) {
            showSidebar();
        } else if (this.props.isSidebarShown && changedWindow.width < widthBreakPoint) {
            hideSidebar();
        }
    }

    /**
     * Method called when we want to dismiss the hamburger menu,
     * will not do anything if it already closed
     * Only changes hamburger state on small screens (e.g. Mobile and mWeb)
     */
    dismissHamburger() {
        if (!this.props.isSidebarShown) {
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

        Animated.timing(this.animationTranslateX, {
            toValue: animationFinalValue,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: false
        }).start(({finished}) => {
            if (finished && hamburgerIsShown) {
                hideSidebar();
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

        // If the hamburger currently is not shown, we want to make it visible before the animation
        if (!this.props.isSidebarShown) {
            showSidebar();
            return;
        }

        // Otherwise, we want to hide it after the animation
        this.animateHamburger(true);
    }

    render() {
        const hamburgerStyle = this.state.isHamburgerEnabled && this.props.isSidebarShown
            ? styles.hamburgerOpenAbsolute : styles.hamburgerOpen;
        const visibility = this.props.isSidebarShown ? styles.dFlex : styles.dNone;
        const appContentWrapperStyle = !this.state.isHamburgerEnabled ? styles.appContentWrapperLarge : null;
        const appContentStyle = !this.state.isHamburgerEnabled ? styles.appContentRounded : null;
        return (
            <SafeAreaProvider>
                <StatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1, styles.h100p]}>
                    {insets => (
                        <View
                            style={[styles.appContentWrapper,
                                appContentWrapperStyle,
                                styles.flexRow,
                                styles.h100p,
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
                                        onLinkClick={this.toggleHamburger}
                                        onChatSwitcherFocus={this.showHamburger}
                                    />
                                </Animated.View>
                                <View
                                    onTouchStart={this.dismissHamburger}
                                    style={[styles.appContent, appContentStyle, styles.flex1, styles.flexColumn]}
                                >
                                    <Header
                                        shouldShowHamburgerButton={this.state.isHamburgerEnabled}
                                        onHamburgerButtonClicked={this.toggleHamburger}
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

export default withIon(
    {
        isSidebarShown: {
            key: IONKEYS.IS_SIDEBAR_SHOWN
        },
    },
)(App);
