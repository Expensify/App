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
import 'react-native-gesture-handler';
import {AppRegistry, View, Text} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import ONYXKEYS from './src/ONYXKEYS';


const config = {
    keys: ONYXKEYS,
};

Onyx.init(config);
Onyx.set(ONYXKEYS.ACCOUNT, {accountname: "myaccount"});

function BasicOnyxComponent(props) {
   return <View style={{flex: 1}}><Text>{JSON.stringify(props.account)}</Text><Text>Test string</Text></View>
}

const WithHOC = withOnyx({account: {key: ONYXKEYS.ACCOUNT}})(BasicOnyxComponent)

function TestEntry() {
  return (
    <View style={{flex: 1, backgroundColor: 'yellow'}}>
      <WithHOC />
    </View>
  )
}

AppRegistry.registerComponent("ShareMenuModuleComponent", () => TestEntry);