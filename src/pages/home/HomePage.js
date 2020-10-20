import React from 'react';
import {
    StatusBar,
    View,
    Dimensions,
    Animated,
    Easing,
    Keyboard
} from 'react-native';
import {SafeAreaInsetsContext, SafeAreaProvider} from 'react-native-safe-area-context';
import {Route} from '../../libs/Router';
import styles, {getSafeAreaPadding} from '../../styles/StyleSheet';
import Header from './HeaderView';
import Sidebar from './sidebar/SidebarView';
import Main from './MainView';
import {
    subscribeToReportCommentEvents,
    fetchAll as fetchAllReports,
    fetchPinnedReportIDs
} from '../../libs/actions/Report';
import {fetch as fetchPersonalDetails} from '../../libs/actions/PersonalDetails';
import * as Pusher from '../../libs/Pusher/pusher';
import UnreadIndicatorUpdater from '../../libs/UnreadIndicatorUpdater';
import ROUTES from '../../ROUTES';
import NetworkConnection from '../../libs/NetworkConnection';

const windowSize = Dimensions.get('window');
const widthBreakPoint = 1000;

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hamburgerShown: true,
            isHamburgerEnabled: windowSize.width <= widthBreakPoint,
        };

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.dismissHamburger = this.dismissHamburger.bind(this);
        this.showHamburger = this.showHamburger.bind(this);
        this.toggleHamburgerBasedOnDimensions = this.toggleHamburgerBasedOnDimensions.bind(this);
        this.animationTranslateX = new Animated.Value(!this.state.hamburgerShown ? -300 : 0);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        Pusher.init().then(subscribeToReportCommentEvents);

        // Fetch all the personal details
        fetchPersonalDetails();

        // Fetch the reportIDs that should be pinned then fetch all the reports
        fetchPinnedReportIDs()
            .then(fetchAllReports);

        UnreadIndicatorUpdater.listenForReportChanges();

        Dimensions.addEventListener('change', this.toggleHamburgerBasedOnDimensions);

        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(true);
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
        if (!this.state.hamburgerShown && changedWindow.width > widthBreakPoint) {
            this.setState({hamburgerShown: true});
        } else if (this.state.hamburgerShown && changedWindow.width < widthBreakPoint) {
            this.setState({hamburgerShown: false});
        }
    }

    /**
     * Method called when we want to dismiss the hamburger menu,
     * will not do anything if it already closed
     * Only changes hamburger state on small screens (e.g. Mobile and mWeb)
     */
    dismissHamburger() {
        if (!this.state.hamburgerShown) {
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
        if (this.state.hamburgerShown) {
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
            // If the hamburger is currently shown, we want to hide it only after the animation is complete
            // Otherwise, we can't see the animation
            if (finished && hamburgerIsShown) {
                this.setState({hamburgerShown: false});
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

        const hamburgerIsShown = this.state.hamburgerShown;

        // If the hamburger currently is not shown, we want to immediately make it visible for the animation
        if (!hamburgerIsShown) {
            this.setState({hamburgerShown: true});
        }
        Keyboard.dismiss();
        this.animateHamburger(hamburgerIsShown);
    }

    render() {
        const hamburgerStyle = this.state.isHamburgerEnabled && this.state.hamburgerShown
            ? styles.hamburgerOpenAbsolute : styles.hamburgerOpen;
        const visibility = this.state.hamburgerShown ? styles.dFlex : styles.dNone;
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
