import { AppRegistry, View, Text } from "react-native";

function MyShareComponent() {
  return <View><Text>Rendered share component!</Text></View>
}

AppRegistry.registerComponent(
  "ShareMenuModuleComponent",
  () => MyShareComponent
);