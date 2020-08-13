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

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hamburgerShown: false,
            dimensions: {
                window
            }

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

    onChange({window: changedWindow}) {
        this.setState({dimensions: {window: changedWindow}});
    }

    toggleHamburger() {
        const currentValue = this.state.hamburgerShown;
        this.setState({hamburgerShown: !currentValue});
    }

    render() {
        const {dimensions} = this.state;
        const largeWindow = dimensions.window.width > 1000;
        const shouldShowHamburger = largeWindow || this.state.hamburgerShown;
        const hamburgerStyle = !shouldShowHamburger ? {
            position: 'absolute', left: 0, top: 0, bottom: 0
        } : null;
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={[styles.flex1, styles.h100p]}>
                    <View style={[styles.appContentWrapper, styles.flexRow, styles.h100p]}>
                        <Route path="/:reportID?">
                            {shouldShowHamburger && (
                            <View style={[{
                                width: 300, zIndex: 20
                            }, hamburgerStyle]}
                            >
                                <Sidebar toggleHamburger={this.toggleHamburger} />
                            </View>
                            )}
                            <View style={[styles.appContent, styles.flex1, styles.flexColumn]}>
                                <Header shouldShowHamburgerButton={!largeWindow}
                                        toggleHamburger={this.toggleHamburger} />
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
