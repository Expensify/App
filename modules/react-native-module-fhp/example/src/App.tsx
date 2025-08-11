import * as React from 'react';

import { StyleSheet, View, Text, Button, Image } from 'react-native';
import {
 FP,
 Capability,
 AndroidCapability,
 Format
 } from 'group-ib-fp';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  enableDebugLogs();
  setCustomerId("react-native-i", (error: any) => {
    console.log(error);
  });
  setTargetURL("https://sbbe.group-ib.ru/api/fl", (error: any) => {
    console.log(error);
  });
  enableCapability(Capability.Swizzle, (error: any, isRun: Boolean) => {
    if (error) {
      console.log(error);
    }
    console.log("Capability run status " + isRun);
  });
  enableCapability(Capability.Behavior, (error: any, isRun: Boolean) => {
    if (error) {
      console.log(error);
    }
    console.log("Capability run status " + isRun);
  });
  enableCapability(Capability.Motion, (error: any, isRun: Boolean) => {
    if (error) {
      console.log(error);
    }
    console.log("Capability run status " + isRun);
  });
  enableAndroidCapability(AndroidCapability.ActivityCollection, (error: any, isRun: Boolean) => {
      if (error) {
        console.log(error);
      }
      console.log("Capability run status " + isRun);
  });

  run((error: any) => {
    console.log("Run error console");
    console.log(error);
  });
  setSessionId("123", (error: any) => {
    console.log(error);
  }
  );
  setSessionId('', (error: any) => {
    console.log(error);
  }
  );
  const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
    },
    tinyLogo: {
      width: 50,
      height: 50,
    },
    logo: {
      width: 66,
      height: 58,
    },
  });
  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <Button title='Test'></Button>
      <Image
        style={styles.logo}
        source={{
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAEXRFWHRTb2Z0d2FyZQBwbmdjcnVzaEB1SfMAAABQSURBVGje7dSxCQBACARB+2/ab8BEeQNhFi6WSYzYLYudDQYGBgYGBgYGBgYGBgYGBgZmcvDqYGBgmhivGQYGBgYGBgYGBgYGBgYGBgbmQw+P/eMrC5UTVAAAAABJRU5ErkJggg==',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
