# group-ib-fp

React Native module with Group-IB FP

## Installation

```sh
npm install group-ib-fp
```

# Android

Add to the project `android/settings.gradle` file:
```groovy
include ':gibsdk'
include ':package'

project(':gibsdk').projectDir = new File(rootProject.projectDir, '../node_modules/group-ib-fp/android/gibsdk')
project(':package').projectDir = new File(rootProject.projectDir, '../node_modules/group-ib-fp/android/package')
```

## Usage

```js
import { FP, Capability, Format, AndroidCapability } from 'group-ib-fp';

// ...

  const fp = FP.getInstance();
  fp.enableDebugLogs();
  fp.changeBehaviorExtendedData(true);
  fp.setCustomerId("gib-i-test", (error: any) => {
    console.log(error);
  });

  fp.setTargetURL("https://fhp-de-back.group-ib.com/api/fl", (error: any) => {
    console.log(error);
  });

  fp.enableCapability(Capability.Swizzle, (error: any, isRun: Boolean) => {
    if (error) {
      console.log(error);
    }
    console.log("Capability run status " + isRun);
  });

  fp.enableCapability(Capability.Behavior, (error: any, isRun: Boolean) => {
    if (error) {
      console.log(error);
    }
    console.log("Capability run status " + isRun);
  });

  fp.enableCapability(Capability.Motion, (error: any, isRun: Boolean) => {
    if (error) {
      console.log(error);
    }
    console.log("Capability run status " + isRun);
  });

  fp.run((error: any) => {
    console.log(error);
  });


  fp.getCookies((cookies: any) => {
    console.log(cookies); // Dictionary with cookies
  });

```
