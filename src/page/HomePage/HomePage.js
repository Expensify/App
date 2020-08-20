import React from 'react';
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
import Sidebar from './SidebarView';
import Main from './MainView';
import Ion from '../../lib/Ion';
import IONKEYS from '../../IONKEYS';
import {initPusher} from '../../lib/actions/ActionsReport';
import * as pusher from '../../lib/Pusher/pusher';

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
        this.toggleHamburgerBasedOnDimensions = this.toggleHamburgerBasedOnDimensions.bind(this);
        this.animationTranslateX = new Animated.Value(!this.state.hamburgerShown ? -300 : 0);
    }

    componentDidMount() {
        Ion.get(IONKEYS.SESSION, 'authToken').then((authToken) => {
            if (authToken) {
                // Initialize the pusher connection
                pusher.init(null, {
                    authToken,
                });

                // Setup the report action handler to subscribe to pusher
                initPusher();
            }
        });
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
     * Method called when we want to toggle the hamburger menu opened and closed
     * Only changes hamburger state on small screens (e.g. Mobile and mWeb)
     */
    toggleHamburger() {
        if (!this.state.isHamburgerEnabled) {
            return;
        }

        const hamburgerIsShown = this.state.hamburgerShown;
        const animationFinalValue = hamburgerIsShown ? -300 : 0;

        // If the hamburger currently is not shown, we want to immediately make it visible for the animation
        if (!hamburgerIsShown) {
            this.setState({hamburgerShown: true});
        }

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
                            <Route path="/:reportID?">
                                <Animated.View style={[
                                    hamburgerStyle,
                                    visibility,
                                    {
                                        transform: [{translateX: this.animationTranslateX}]
                                    }]}
                                >
                                    <Sidebar insets={insets} onLinkClick={this.toggleHamburger} />
                                </Animated.View>
                                <View style={[styles.appContent, appContentStyle, styles.flex1, styles.flexColumn]}>
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
App.displayName = 'App';
