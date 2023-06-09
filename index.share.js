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
import {AppRegistry} from 'react-native';
import DotIndicatorMessage from './src/components/DotIndicatorMessage'
import styles from './src/styles/styles'

function TestEntry () {
  return (
                    <DotIndicatorMessage
                        style={[styles.mv2]}
                        type="success"
                        messages={{0: 'hello'}}
                    />
  )
}

AppRegistry.registerComponent("ShareMenuModuleComponent", () => TestEntry);