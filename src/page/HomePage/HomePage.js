import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
    Dimensions,
} from 'react-native';
import {Route} from '../../lib/Router';
import styles from '../../style/StyleSheet';
import Header from './HeaderView';
import Sidebar from './SidebarView';
import Main from './MainView';
import Ion from '../../lib/Ion';
import IONKEYS from '../../IONKEYS';
import {initPusher} from '../../lib/actions/ActionsReport';
import * as pusher from '../../lib/Pusher/pusher';

const window = Dimensions.get('window');
const widthBreakPoint = 1000;

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hamburgerShown: window.width > widthBreakPoint,
            isSmallScreen: window.width < widthBreakPoint
        };

        this.toggleHamburger = this.toggleHamburger.bind(this);
        this.onChange = this.onChange.bind(this);
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

                // TODO: Remove, debugging
                Ion.set(IONKEYS.APP_REDIRECT_TO, '/36');

                Dimensions.addEventListener('change', this.onChange);
            }
        });
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChange);
    }

    /**
     * Fired when the windows dimensions changes
     * @param {object} changedWindow
     */
    onChange({window: changedWindow}) {
        this.setState({isSmallScreen: changedWindow.width < widthBreakPoint});
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
        if (!this.state.isSmallScreen) {
            return;
        }

        const currentValue = this.state.hamburgerShown;
        this.setState({hamburgerShown: !currentValue});
    }

    render() {
        const hamburgerStyle = this.state.isSmallScreen && this.state.hamburgerShown ? {
            position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2, width: 300
        } : {width: 300};
        const appContentStyle = this.state.hamburgerShown ? styles.appContentRounded : null;
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={[styles.flex1, styles.h100p, styles.appContent]}>
                    <View style={[styles.appContentWrapper, styles.flexRow, styles.h100p]}>
                        <Route path="/:reportID?">
                            {this.state.hamburgerShown && (
                            <View style={[hamburgerStyle]}>
                                <Sidebar toggleHamburger={this.toggleHamburger} />
                            </View>
                            )}
                            <View style={[styles.appContent, styles.flex1, styles.flexColumn, appContentStyle]}>
                                <Header
                                    shouldShowHamburgerButton={!this.state.hamburgerShown}
                                    toggleHamburger={this.toggleHamburger}
                                />
                                <Main />
                            </View>
                        </Route>
                    </View>
                </SafeAreaView>
            </>
        );
    }
}
App.displayName = 'App';
