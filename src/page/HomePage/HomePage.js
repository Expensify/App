import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
} from 'react-native';
import styles from '../../style/StyleSheet';
import Header from './HeaderView';
import Sidebar from './SidebarView';
import Main from './MainView';

const App = () => (
    <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
            <View>
                <Header />
                <View style={[styles.flexRow, styles.mainContentWrapper]}>
                    <Sidebar />
                    <Main />
                </View>
            </View>
        </SafeAreaView>
    </>
);
App.displayName = 'App';
export default App;
