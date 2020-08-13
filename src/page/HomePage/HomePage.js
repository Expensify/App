import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
} from 'react-native';
import {
    Route,
    Switch,
    Router,
    Redirect
} from '../../lib/Router';
import styles from '../../style/StyleSheet';
import Header from './HeaderView';
import Sidebar from './SidebarView';
import Main from './MainView';
import Ion from '../../lib/Ion';
import IONKEYS from '../../IONKEYS';
import {fetchAll, initPusher} from '../../lib/actions/ActionsReport';
import * as pusher from '../../lib/Pusher/pusher';
import WithIon from '../../components/WithIon';

class App extends React.Component {
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
    }

    render() {
        const firstReportID = this.state && this.state.reports ? this.state.reports[0].reportID : '';
        const redirectPath = `/${firstReportID}`;
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={[styles.flex1, styles.h100p]}>
                    <View style={[styles.appContentWrapper, styles.flexRow, styles.h100p]}>
                        <Router>
                            <Switch>
                                {firstReportID && <Redirect exact from="/" to={redirectPath} />}
                                <Route path="/:reportID?">
                                    <View style={{width: 300}}>
                                        <Sidebar />
                                    </View>
                                    <View style={[styles.appContent, styles.flex1, styles.flexColumn]}>
                                        <Header />
                                        <Main />
                                    </View>
                                </Route>
                            </Switch>
                        </Router>
                    </View>
                </SafeAreaView>
            </>
        );
    }
}
App.displayName = 'App';

export default WithIon({
    reports: {
        key: IONKEYS.REPORTS,
        loader: fetchAll,
        prefillWithKey: IONKEYS.REPORTS,
    },
})(App);
