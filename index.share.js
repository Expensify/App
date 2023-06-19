// import { AppRegistry, View, Text } from "react-native";
//
// function MyShareComponent() {
//   return <View><Text>Rendered share component!</Text></View>
// }
//
// AppRegistry.registerComponent(
//   "ShareMenuModuleComponent",
//   () => MyShareComponent
// );
import {AppRegistry, ScrollView, Text, View} from 'react-native';
import 'react-native-gesture-handler';
import Onyx, {withOnyx} from 'react-native-onyx';
import ONYXKEYS from './src/ONYXKEYS';
import ExpensifyWordmark from './src/components/ExpensifyWordmark';

const config = {
    keys: ONYXKEYS,
};

Onyx.init(config);

function BasicOnyxComponent(props) {
    return (
        <ScrollView
            contentContainerStyle={{padding: 24}}
            style={{flex: 1}}
        >
            <ExpensifyWordmark />
            <View style={{padding: 24}} />
            {Object.entries(props).map(([prop, json]) => (
                <Text style={{color: '#E7ECE9', fontWeight: 'bold'}}>
                    {prop.toUpperCase()}
                    {'\n\n'}
                    {Object.entries(json).map(([key, value]) => (
                        <Text style={{color: '#E7ECE9', fontWeight: 'normal'}}>
                            {key}: {JSON.stringify(value)}
                            {'\n\n'}
                        </Text>
                    ))}
                </Text>
            ))}
        </ScrollView>
    );
}

const WithHOC = withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    session: {key: ONYXKEYS.SESSION},
})(BasicOnyxComponent);

function TestEntry() {
    return (
        <View style={{flex: 1, backgroundColor: '#07271F'}}>
            <WithHOC />
        </View>
    );
}

AppRegistry.registerComponent('ShareMenuModuleComponent', () => TestEntry);
