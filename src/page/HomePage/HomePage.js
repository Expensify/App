import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
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
import ROUTES from '../../ROUTES';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hamburgerShown: false
        };

        this.toggleHamburger = this.toggleHamburger.bind(this);
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
                // Ion.set(IONKEYS.APP_REDIRECT_TO, '/36');

                Ion.get(IONKEYS.REPORTS).then((reports) => {
                    const firstReportID = reports[0].reportID ?? '';
                    if (firstReportID) {
                        console.warn(`Report ID ${firstReportID}`)
                        Ion.set(IONKEYS.APP_REDIRECT_TO, `/${firstReportID}`);
                    }
                });
            }
        });
    }

    toggleHamburger() {
        const currentValue = this.state.hamburgerShown;
        this.setState({hamburgerShown: !currentValue});
    }

    render() {
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={[styles.flex1, styles.h100p]}>
                    <View style={[styles.appContentWrapper, styles.flexRow, styles.h100p]}>
                        <Route path="/:reportID?">
                            {this.state.hamburgerShown && (
                            <View style={{position: 'absolute', left: 0, top: 0, bottom:0, width: 300, zIndex: 20}}>
                                <Sidebar toggleHamburger={this.toggleHamburger} />
                            </View>
                            )}
                            <View style={[styles.appContent, styles.flex1, styles.flexColumn]}>
                                <Header toggleHamburger={this.toggleHamburger} />
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
