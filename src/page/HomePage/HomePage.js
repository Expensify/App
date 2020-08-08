import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
} from 'react-native';
import Header from './Header';

const App = () => (
    <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
            <View>
                <Header />
            </View>
        </SafeAreaView>
    </>
);
App.displayName = 'App';
export default App;
