import React from 'react';
import {
    SafeAreaView,
    Text,
    StatusBar,
    View,
    Button
} from 'react-native';
import {signOut} from '../../store/actions/SessionActions';

const App = () => (
    <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{padding: 20}}>
            <View>
                <Text
                    style={{
                        fontSize: 20,
                        margin: 20,
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }}
                >
                    React Native Chat Homepage!
                </Text>
                <Button onPress={signOut} title="Sign Out" />
            </View>
        </SafeAreaView>
    </>
);
App.displayName = 'App';
export default App;
