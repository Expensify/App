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

const App = () => (
    <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={[styles.flex1, styles.h100p]}>
            <View style={[styles.flexColumn, styles.h100p]}>
                <Route path="/:reportID?">
                    <Header />
                    <View style={[styles.flex1, styles.flexRow]}>
                        <Sidebar />
                        <Main />
                    </View>
                </Route>
            </View>
        </SafeAreaView>
    </>
);
App.displayName = 'App';
export default App;
